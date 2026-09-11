const User = require("../database/models/userModel");
const Repository = require("../database/models/repoModel");
const jwt = require("jsonwebtoken");
const s3Git = require("./s3GitHelper");

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
        
        // Find owner
        const owner = await User.findOne({ username });
        if (!owner) return res.status(404).json({ status: false, message: "User not found" });

        const repo = await Repository.findOne({ name: repoName, owner: owner._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

        // Optionally, check if it has a HEAD ref in S3 to know if it's empty
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
        const owner = await User.findOne({ username });
        const repo = await Repository.findOne({ name: repoName, owner: owner?._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

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
        const owner = await User.findOne({ username });
        const repo = await Repository.findOne({ name: repoName, owner: owner?._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

        const branch = req.query.branch;
        let refPath = branch ? `refs/heads/${branch}` : await s3Git.getHeadRef(repo.s3Prefix);
        if (!refPath) return res.status(200).json({ status: true, commits: [] });
        
        let currentOid = await s3Git.getRefOid(repo.s3Prefix, refPath);
        const commits = [];

        // Traverse history (limit to 50 for performance)
        for (let i = 0; i < 50; i++) {
            if (!currentOid) break;
            const commitObj = await s3Git.getGitObject(repo.s3Prefix, currentOid);
            if (!commitObj) break;

            const commit = s3Git.parseCommit(commitObj.content);
            commits.push({
                oid: currentOid,
                message: commit.message,
                author: commit.author,
            });
            currentOid = commit.parent;
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
        const owner = await User.findOne({ username });
        const repo = await Repository.findOne({ name: repoName, owner: owner?._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

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
        const owner = await User.findOne({ username });
        const repo = await Repository.findOne({ name: repoName, owner: owner?._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

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

const adminCleanup = async (req, res) => {
    try {
        const result = await Repository.deleteMany({ name: { $ne: "project-test" } });
        await Repository.updateMany({ name: "project-test" }, { isPrivate: false });
        return res.status(200).json({ status: true, message: `Deleted ${result.deletedCount} repos. Set project-test to public.` });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Error in cleanup" });
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
        const owner = await User.findOne({ username });
        const repo = await Repository.findOne({ name: repoName, owner: owner?._id });
        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

        const commitObj = await s3Git.getGitObject(repo.s3Prefix, oid);
        if (!commitObj) return res.status(404).json({ status: false, message: "Commit not found" });

        const commit = s3Git.parseCommit(commitObj.content);
        const parentOid = commit.parents && commit.parents.length > 0 ? commit.parents[0] : null;

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
    adminCleanup,
    mergeBranches,
    getCommitDiff
};
