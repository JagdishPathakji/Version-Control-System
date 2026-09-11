import sys

content = """
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
"""

with open('backend1/controllers/repoController.js', 'r', encoding='utf-8') as f:
    orig = f.read()

orig = orig.replace('module.exports = {', content + '\nmodule.exports = {')
orig = orig.replace('mergeBranches', 'mergeBranches,\n    getCommitDiff')

with open('backend1/controllers/repoController.js', 'w', encoding='utf-8') as f:
    f.write(orig)

# Now add the route
with open('backend1/routes/repo.router.js', 'r', encoding='utf-8') as f:
    router_code = f.read()
router_code = router_code.replace('repoRouter.get("/repo/:username/:repoName/commits", repoController.getRepoCommits);', 'repoRouter.get("/repo/:username/:repoName/commits", repoController.getRepoCommits);\nrepoRouter.get("/repo/:username/:repoName/commit/:oid/diff", repoController.getCommitDiff);')
with open('backend1/routes/repo.router.js', 'w', encoding='utf-8') as f:
    f.write(router_code)
