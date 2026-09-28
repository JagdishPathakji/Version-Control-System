const jwt = require("jsonwebtoken");
const User = require("../database/models/userModel");
const Repository = require("../database/models/repoModel");
const { putS3Object } = require("./s3GitHelper");
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: process.env.AWS_REGION || "ap-south-1" });
const BUCKET_NAME = process.env.S3_BUCKET || "girgit-project"; 

async function getS3ObjectContent(key) {
    try {
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
        const response = await s3Client.send(command);
        const byteArray = await response.Body.transformToByteArray();
        return Buffer.from(byteArray);
    } catch (err) {
        if (err.name === 'NoSuchKey') return null;
        throw err;
    }
}

const pushFromCLI = async (req, res) => {
    try {
        // Authenticate CLI User
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found. Please run 'girgit login' first." });
        }
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return res.status(401).send({ status: false, message: "Invalid or expired token. Please log in again." });
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) return res.status(404).send({ status: false, message: "User not found" });

        // Parse payload
        // Format: { repo: "username/reponame", objects: { "sha": "base64" }, refs: { "refs/heads/master": "sha", "HEAD": "ref: refs/heads/master" } }
        const { repo, objects, refs } = req.body;
        if (!repo || !repo.includes('/')) {
            return res.status(400).send({ status: false, message: "Invalid remote URL format. Must be username/repo" });
        }

        const [ownerUsername, repoName] = repo.split('/');
        
        // Authorization check: User must own the repo (future: check contributors)
        if (user.username !== ownerUsername) {
            // Check if repo exists and if user is a contributor
            const repository = await Repository.findOne({ name: repoName }).populate('owner');
            if (!repository || repository.owner.username !== ownerUsername) {
                return res.status(403).send({ status: false, message: "Forbidden: You do not have permission to push to this repository." });
            }
        }

        // Ensure repo exists in DB
        const repository = await Repository.findOne({ name: repoName }).populate('owner');
        if (!repository || repository.owner.username !== ownerUsername) {
            return res.status(404).send({ status: false, message: `Repository ${repo} not found.` });
        }

        const prefix = `${ownerUsername}/${repoName}`;

        // Upload objects
        const objKeys = Object.keys(objects || {});
        for (let sha of objKeys) {
            const buffer = Buffer.from(objects[sha], 'base64');
            await putS3Object(`${prefix}/objects/${sha}`, buffer);
        }

        // Upload refs
        const refKeys = Object.keys(refs || {});
        for (let refPath of refKeys) {
            const content = refs[refPath];
            await putS3Object(`${prefix}/${refPath}`, Buffer.from(content, 'utf-8'));
        }

        // Update MongoDB timestamp
        repository.updatedAt = new Date();
        await repository.save();

        res.status(200).send({ status: true, message: `Successfully pushed to ${repo}` });
    } catch (error) {
        console.error("Error in pushFromCLI:", error);
        res.status(500).send({ status: false, message: "Internal Server Error during push" });
    }
};

const cloneFromCLI = async (req, res) => {
    try {
        const repo = req.query.repo; // Format: "username/repo"
        if (!repo || !repo.includes('/')) {
            return res.status(400).send({ status: false, message: "Invalid repo parameter. Must be username/repo" });
        }

        const [ownerUsername, repoName] = repo.split('/');
        
        // Check permissions (Public or Authenticated Private)
        const repository = await Repository.findOne({ name: repoName }).populate('owner');
        if (!repository || repository.owner.username !== ownerUsername) {
            return res.status(404).send({ status: false, message: `Repository ${repo} not found.` });
        }

        if (repository.visibility === "private") {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).send({ status: false, message: "Unauthorized: Private repository requires login. Please run 'girgit login'." });
            }
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const user = await User.findOne({ email: decoded.email });
                if (!user || user.username !== ownerUsername) {
                    return res.status(403).send({ status: false, message: "Forbidden: You do not have permission to clone this private repository." });
                }
            } catch (err) {
                return res.status(401).send({ status: false, message: "Invalid or expired token. Please log in again." });
            }
        }

        const prefix = `${ownerUsername}/${repoName}`;
        
        // Fetch all objects and refs from S3 for this prefix
        let isTruncated = true;
        let continuationToken = undefined;
        let s3Objects = [];

        while (isTruncated) {
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: prefix + "/",
                ContinuationToken: continuationToken
            });
            const response = await s3Client.send(command);
            if (response.Contents) {
                s3Objects.push(...response.Contents);
            }
            isTruncated = response.IsTruncated;
            continuationToken = response.NextContinuationToken;
        }

        const objects = {};
        const refs = {};

        for (let obj of s3Objects) {
            const relativePath = obj.Key.slice(prefix.length + 1); // e.g., "objects/sha..." or "refs/heads/master" or "HEAD"
            
            const content = await getS3ObjectContent(obj.Key);
            if (!content) continue;

            if (relativePath.startsWith('objects/')) {
                const sha = relativePath.split('/')[1];
                objects[sha] = content.toString('base64');
            } else {
                // It's a ref or HEAD
                refs[relativePath] = content.toString('utf-8');
            }
        }

        res.status(200).send({
            status: true,
            objects,
            refs
        });
    } catch (error) {
        console.error("Error in cloneFromCLI:", error);
        res.status(500).send({ status: false, message: "Internal Server Error during clone" });
    }
};

module.exports = {
    pushFromCLI,
    cloneFromCLI
};
