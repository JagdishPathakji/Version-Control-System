const User = require("../database/models/userModel");
const Repository = require("../database/models/repoModel");
const jwt = require("jsonwebtoken");
const s3Git = require("./s3GitHelper");
const archiver = require("archiver");

// Helper to authenticate user from cookie
const getUser = async (req) => {
    const token = req.cookies.token;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return await User.findOne({ email: decoded.email });
    } catch {
        return null;
    }
}

// Helper to look up repo and enforce owner-existence and private repo authorization
const getAuthorizedRepo = async (req, username, repoName) => {
    const owner = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });
    if (!owner) return { error: { status: 404, message: "User not found" } };

    const repo = await Repository.findOne({ name: { $regex: new RegExp(`^${repoName}$`, "i") }, owner: owner._id });
    if (!repo) return { error: { status: 404, message: "Repository not found" } };

    if (repo.isPrivate) {
        const user = await getUser(req);
        if (!user || user._id.toString() !== owner._id.toString()) {
            return { error: { status: 403, message: "Access denied: Private repository" } };
        }
    }

    return { owner, repo };
};

const createRepo = async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ status: false, message: "Unauthorized" });

        const { name, description, isPrivate } = req.body;
        if (!name) return res.status(400).json({ status: false, message: "Repository name is required" });

        const exists = await Repository.findOne({ name, owner: user._id });
        if (exists) return res.status(400).json({ status: false, message: "Repository name already exists" });

        // Build S3 Prefix: username/repoName
        const s3Prefix = `${user.username}/${name}`;

        const repo = new Repository({
            name,
            description,
            isPrivate: !!isPrivate,
            owner: user._id,
            s3Prefix
        });

        await repo.save();
        
        return res.status(201).json({ status: true, message: "Repository created", repo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const getUserRepos = async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ status: false, message: "Unauthorized" });

        const repos = await Repository.find({ owner: user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ status: true, repos });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const getRepoDetails = async (req, res) => {
    try {
        const { username, repoName } = req.params;
        const { repo, error } = await getAuthorizedRepo(req, username, repoName);
        if (error) return res.status(error.status).json({ status: false, message: error.message });

        const headRef = await s3Git.getHeadRef(repo.s3Prefix);
        const isEmpty = !headRef;

        return res.status(200).json({ status: true, repo, isEmpty, s3Prefix: repo.s3Prefix });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const getRepoFiles = async (req, res) => {
    try {
        const { username, repoName } = req.params;
        const { repo, error } = await getAuthorizedRepo(req, username, repoName);
        if (error) return res.status(error.status).json({ status: false, message: error.message });

        let oid = req.query.oid; // if browsing sub-folder or specific commit
        const branch = req.query.branch;
        
        if (!oid) {
            // Get root tree from HEAD or branch
            let refPath = branch ? `refs/heads/${branch}` : await s3Git.getHeadRef(repo.s3Prefix);
            if (!refPath) return res.status(200).json({ status: true, files: [] }); // Empty repo
            
            oid = await s3Git.getRefOid(repo.s3Prefix, refPath);
            if (!oid) return res.status(200).json({ status: true, files: [] });
        }

        // Check if the oid is a commit (if navigating from history)
        let treeObj = await s3Git.getGitObject(repo.s3Prefix, oid);
        if (treeObj && treeObj.type === 'commit') {
            const commit = s3Git.parseCommit(treeObj.content);
            oid = commit.tree;
            treeObj = await s3Git.getGitObject(repo.s3Prefix, oid);
        }

        if (!treeObj || treeObj.type !== 'tree') {
            return res.status(404).json({ status: false, message: "Tree not found" });
        }

        const entries = s3Git.parseTree(treeObj.content);
        return res.status(200).json({ status: true, files: entries });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const getRepoCommits = async (req, res) => {
    try {
        const { username, repoName } = req.params;
        const { repo, error } = await getAuthorizedRepo(req, username, repoName);
        if (error) return res.status(error.status).json({ status: false, message: error.message });

        const branch = req.query.branch;
        let refPath = branch ? `refs/heads/${branch}` : await s3Git.getHeadRef(repo.s3Prefix);
        if (!refPath) return res.status(200).json({ status: true, commits: [] });
        
        let currentOid = await s3Git.getRefOid(repo.s3Prefix, refPath);
        const visited = new Set();
        const queue = currentOid ? [currentOid] : [];
        const commits = [];

        // Traverse history with queue so merge parents aren't lost (limit to 50 for performance)
        while (queue.length > 0 && commits.length < 50) {
            const oid = queue.shift();
            if (!oid || visited.has(oid)) continue;
            visited.add(oid);

            const commitObj = await s3Git.getGitObject(repo.s3Prefix, oid);
            if (!commitObj) continue;

            const commit = s3Git.parseCommit(commitObj.content);
            const parentList = (commit.parents && commit.parents.length > 0) 
                ? commit.parents 
                : (commit.parent ? [commit.parent] : []);

            commits.push({
                oid: oid,
                message: commit.message,
                author: commit.author,
                parent: commit.parent,
                parents: parentList
            });

            for (const p of parentList) {
                if (!visited.has(p)) queue.push(p);
            }
        }

        return res.status(200).json({ status: true, commits });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const getBlobContent = async (req, res) => {
    try {
        const { username, repoName, oid } = req.params;
        const { repo, error } = await getAuthorizedRepo(req, username, repoName);
        if (error) return res.status(error.status).json({ status: false, message: error.message });

        const blobObj = await s3Git.getGitObject(repo.s3Prefix, oid);
        if (!blobObj || blobObj.type !== 'blob') {
            return res.status(404).json({ status: false, message: "Blob not found" });
        }

        // Return as string for display
        return res.status(200).json({ status: true, content: blobObj.content.toString('utf-8') });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const getRepoBranches = async (req, res) => {
    try {
        const { username, repoName } = req.params;
        const { repo, error } = await getAuthorizedRepo(req, username, repoName);
        if (error) return res.status(error.status).json({ status: false, message: error.message });

        const branches = await s3Git.getBranches(repo.s3Prefix);
        return res.status(200).json({ status: true, branches });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const getPublicRepos = async (req, res) => {
    try {
        const { username } = req.params;
        const owner = await User.findOne({ username });
        if (!owner) return res.status(404).json({ status: false, message: "User not found" });

        const repos = await Repository.find({ owner: owner._id, isPrivate: false }).sort({ createdAt: -1 });
        return res.status(200).json({ status: true, repos });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

const editFile = async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ status: false, message: "Unauthorized" });

        const { username, repoName } = req.params;
        if (user.username !== username) return res.status(403).json({ status: false, message: "Forbidden" });
        
        const repo = await Repository.findOne({ name: repoName, owner: user._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

        const { filename, content, commitMessage, branch = "master" } = req.body;

        // 1. Write the new Blob
        const blobOid = await s3Git.writeObject(repo.s3Prefix, Buffer.from(content, 'utf-8'), 'blob');

        // 2. Fetch current head and tree
        const headOid = await s3Git.getRefOid(repo.s3Prefix, `refs/heads/${branch}`);
        let currentTreeEntries = [];
        if (headOid) {
            const commitObj = await s3Git.getGitObject(repo.s3Prefix, headOid);
            if (commitObj) {
                const commit = s3Git.parseCommit(commitObj.content);
                const treeObj = await s3Git.getGitObject(repo.s3Prefix, commit.tree);
                if (treeObj) {
                    currentTreeEntries = s3Git.parseTree(treeObj.content);
                }
            }
        }

        // 3. Update the tree entry
        const existingIdx = currentTreeEntries.findIndex(e => e.name === filename);
        if (existingIdx >= 0) {
            currentTreeEntries[existingIdx].oid = blobOid;
        } else {
            currentTreeEntries.push({ type: 'blob', oid: blobOid, name: filename });
        }

        // Sort entries by name
        currentTreeEntries.sort((a, b) => a.name.localeCompare(b.name));

        // Format tree string (girgit format: "type oid name\n")
        const treeString = currentTreeEntries.map(e => `${e.type} ${e.oid} ${e.name}\n`).join('');
        const treeOid = await s3Git.writeObject(repo.s3Prefix, Buffer.from(treeString, 'utf-8'), 'tree');

        // 4. Create Commit
        let commitData = `tree ${treeOid}\n`;
        if (headOid) {
            commitData += `parent ${headOid}\n`;
        }
        commitData += `author ${user.username}\n\n`;
        commitData += `${commitMessage || `Update ${filename}`}\n`;

        const commitOid = await s3Git.writeObject(repo.s3Prefix, Buffer.from(commitData, 'utf-8'), 'commit');

        // 5. Update Ref
        await s3Git.putS3Object(`${repo.s3Prefix}/refs/heads/${branch}`, Buffer.from(commitOid, 'utf-8'));

        repo.updatedAt = new Date();
        await repo.save();

        return res.status(200).json({ status: true, message: "File updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}



const mergeBranches = async (req, res) => {
    try {
        const user = await getUser(req);
        if (!user) return res.status(401).json({ status: false, message: "Unauthorized" });

        const { username, repoName } = req.params;
        if (user.username !== username) return res.status(403).json({ status: false, message: "Forbidden" });

        const repo = await Repository.findOne({ name: repoName, owner: user._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

        const { baseBranch, compareBranch } = req.body;
        if (!baseBranch || !compareBranch) return res.status(400).json({ status: false, message: "Branches required" });

        const baseOid = await s3Git.getRefOid(repo.s3Prefix, `refs/heads/${baseBranch}`);
        const compareOid = await s3Git.getRefOid(repo.s3Prefix, `refs/heads/${compareBranch}`);

        if (!baseOid || !compareOid) return res.status(400).json({ status: false, message: "Branch not found" });

        if (baseOid === compareOid) return res.status(400).json({ status: false, message: "Branches are identical" });

        const baseCommitObj = await s3Git.getGitObject(repo.s3Prefix, baseOid);
        const compareCommitObj = await s3Git.getGitObject(repo.s3Prefix, compareOid);

        const baseCommit = s3Git.parseCommit(baseCommitObj.content);
        const compareCommit = s3Git.parseCommit(compareCommitObj.content);

        const baseTreeObj = await s3Git.getGitObject(repo.s3Prefix, baseCommit.tree);
        const compareTreeObj = await s3Git.getGitObject(repo.s3Prefix, compareCommit.tree);

        const baseEntries = baseTreeObj ? s3Git.parseTree(baseTreeObj.content) : [];
        const compareEntries = compareTreeObj ? s3Git.parseTree(compareTreeObj.content) : [];

        const mergedMap = new Map();
        baseEntries.forEach(e => mergedMap.set(e.name, e));
        compareEntries.forEach(e => mergedMap.set(e.name, e));

        const mergedEntries = Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        const treeString = mergedEntries.map(e => `${e.type} ${e.oid} ${e.name}\n`).join('');
        
        const treeOid = await s3Git.writeObject(repo.s3Prefix, Buffer.from(treeString, 'utf-8'), 'tree');

        let commitData = `tree ${treeOid}\nparent ${baseOid}\nparent ${compareOid}\nauthor ${user.username}\n\nMerge branch '${compareBranch}' into '${baseBranch}'\n`;
        const newCommitOid = await s3Git.writeObject(repo.s3Prefix, Buffer.from(commitData, 'utf-8'), 'commit');

        await s3Git.putS3Object(`${repo.s3Prefix}/refs/heads/${baseBranch}`, Buffer.from(newCommitOid, 'utf-8'));

        return res.status(200).json({ status: true, message: "Merged successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};


const getCommitDiff = async (req, res) => {
    try {
        const { username, repoName, oid } = req.params;
        const { repo, error } = await getAuthorizedRepo(req, username, repoName);
        if (error) return res.status(error.status).json({ status: false, message: error.message });

        const commitObj = await s3Git.getGitObject(repo.s3Prefix, oid);
        if (!commitObj) return res.status(404).json({ status: false, message: "Commit not found" });

        const commit = s3Git.parseCommit(commitObj.content);
        const parentOid = (commit.parents && commit.parents.length > 0) 
            ? commit.parents[0] 
            : (commit.parent || null);

        const currentTreeObj = await s3Git.getGitObject(repo.s3Prefix, commit.tree);
        const currentEntries = currentTreeObj ? s3Git.parseTree(currentTreeObj.content) : [];

        let parentEntries = [];
        if (parentOid) {
            const parentCommitObj = await s3Git.getGitObject(repo.s3Prefix, parentOid);
            if (parentCommitObj) {
                const parentCommit = s3Git.parseCommit(parentCommitObj.content);
                const parentTreeObj = await s3Git.getGitObject(repo.s3Prefix, parentCommit.tree);
                if (parentTreeObj) {
                    parentEntries = s3Git.parseTree(parentTreeObj.content);
                }
            }
        }

        const diffs = [];
        const allNames = new Set([...currentEntries.map(e => e.name), ...parentEntries.map(e => e.name)]);

        for (const name of allNames) {
            const currentEntry = currentEntries.find(e => e.name === name);
            const parentEntry = parentEntries.find(e => e.name === name);

            if (currentEntry && parentEntry && currentEntry.oid === parentEntry.oid) {
                continue; // Unchanged
            }

            let oldContent = "";
            let newContent = "";

            if (parentEntry && parentEntry.type === "blob") {
                const oldBlob = await s3Git.getGitObject(repo.s3Prefix, parentEntry.oid);
                oldContent = oldBlob ? oldBlob.content.toString("utf-8") : "";
            }

            if (currentEntry && currentEntry.type === "blob") {
                const newBlob = await s3Git.getGitObject(repo.s3Prefix, currentEntry.oid);
                newContent = newBlob ? newBlob.content.toString("utf-8") : "";
            }

            // Skip if both are trees
            if ((currentEntry && currentEntry.type === "tree") || (parentEntry && parentEntry.type === "tree")) {
                continue;
            }

            diffs.push({
                filename: name,
                oldContent,
                newContent,
                status: !parentEntry ? "added" : !currentEntry ? "removed" : "modified"
            });
        }

        return res.status(200).json({ status: true, diffs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};


function createZipArchive(options = { zlib: { level: 9 } }) {
    if (typeof archiver === 'function') {
        return archiver('zip', options);
    }
    if (archiver && archiver.ZipArchive) {
        return new archiver.ZipArchive(options);
    }
    if (archiver && typeof archiver.create === 'function') {
        return archiver.create('zip', options);
    }
    throw new Error('Unsupported archiver package format');
}

// Recursively traverse git tree objects to collect all files with relative paths
async function collectTreeFiles(prefix, treeOid, currentPath = "") {
    const treeObj = await s3Git.getGitObject(prefix, treeOid);
    if (!treeObj || treeObj.type !== 'tree') return [];
    
    const entries = s3Git.parseTree(treeObj.content);
    const files = [];
    
    for (const entry of entries) {
        const filePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
        if (entry.type === 'blob') {
            const blobObj = await s3Git.getGitObject(prefix, entry.oid);
            if (blobObj && blobObj.content) {
                files.push({
                    path: filePath,
                    content: blobObj.content
                });
            }
        } else if (entry.type === 'tree') {
            const subFiles = await collectTreeFiles(prefix, entry.oid, filePath);
            files.push(...subFiles);
        }
    }
    
    return files;
}

const downloadZip = async (req, res) => {
    try {
        const { username, repoName } = req.params;
        const { repo, error } = await getAuthorizedRepo(req, username, repoName);
        if (error) return res.status(error.status).json({ status: false, message: error.message });

        let oid = req.query.oid;
        const branch = req.query.branch || "master";

        if (!oid) {
            let refPath = `refs/heads/${branch}`;
            oid = await s3Git.getRefOid(repo.s3Prefix, refPath);
            if (!oid) {
                const headRef = await s3Git.getHeadRef(repo.s3Prefix);
                if (headRef) oid = await s3Git.getRefOid(repo.s3Prefix, headRef);
            }
        }

        if (!oid) {
            return res.status(404).json({ status: false, message: "Repository has no commits or branch not found" });
        }

        // If oid is a commit, resolve its root tree
        let commitObj = await s3Git.getGitObject(repo.s3Prefix, oid);
        let treeOid = oid;
        if (commitObj && commitObj.type === 'commit') {
            const commit = s3Git.parseCommit(commitObj.content);
            treeOid = commit.tree;
        }

        const files = await collectTreeFiles(repo.s3Prefix, treeOid);

        const archive = createZipArchive({ zlib: { level: 9 } });
        const zipFilename = `${repoName}-${branch}.zip`;

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

        archive.pipe(res);

        for (const file of files) {
            archive.append(file.content, { name: `${repoName}/${file.path}` });
        }

        await archive.finalize();
    } catch (error) {
        console.error("Error generating zip:", error);
        if (!res.headersSent) {
            res.status(500).json({ status: false, message: "Failed to generate ZIP archive" });
        }
    }
};

module.exports = {
    createRepo,
    getUserRepos,
    getRepoDetails,
    getRepoFiles,
    getRepoCommits,
    getBlobContent,
    getRepoBranches,
    getPublicRepos,
    editFile,
    mergeBranches,
    getCommitDiff,
    downloadZip
};
