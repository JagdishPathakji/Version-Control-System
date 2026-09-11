import sys

content = """
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
        const treeString = mergedEntries.map(e => `${e.type} ${e.oid} ${e.name}\\n`).join('');
        
        const treeOid = await s3Git.writeObject(repo.s3Prefix, Buffer.from(treeString, 'utf-8'), 'tree');

        let commitData = `tree ${treeOid}\\nparent ${baseOid}\\nparent ${compareOid}\\nauthor ${user.username}\\n\\nMerge branch '${compareBranch}' into '${baseBranch}'\\n`;
        const newCommitOid = await s3Git.writeObject(repo.s3Prefix, Buffer.from(commitData, 'utf-8'), 'commit');

        await s3Git.putS3Object(`${repo.s3Prefix}/refs/heads/${baseBranch}`, Buffer.from(newCommitOid, 'utf-8'));

        return res.status(200).json({ status: true, message: "Merged successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};
"""

with open('backend1/controllers/repoController.js', 'r', encoding='utf-8') as f:
    orig = f.read()
orig = orig.replace('module.exports = {', content + '\nmodule.exports = {')
orig = orig.replace('adminCleanup', 'adminCleanup,\n    mergeBranches')
with open('backend1/controllers/repoController.js', 'w', encoding='utf-8') as f:
    f.write(orig)
