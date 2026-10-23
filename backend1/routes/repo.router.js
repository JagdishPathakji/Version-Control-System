const express = require("express");
const repoRouter = express.Router();
const repoController = require("../controllers/repoController");
const cliController = require("../controllers/cliController");

repoRouter.post("/cli/push", cliController.pushFromCLI);
repoRouter.get("/cli/clone", cliController.cloneFromCLI);

repoRouter.post("/repo/create", repoController.createRepo);
repoRouter.get("/user/repos", repoController.getUserRepos);

repoRouter.get("/repo/:username/:repoName", repoController.getRepoDetails);
repoRouter.get("/repo/:username/:repoName/branches", repoController.getRepoBranches);
repoRouter.get("/repo/:username/:repoName/files", repoController.getRepoFiles);
repoRouter.get("/repo/:username/:repoName/commits", repoController.getRepoCommits);
repoRouter.get("/repo/:username/:repoName/commit/:oid/diff", repoController.getCommitDiff);
repoRouter.get("/repo/:username/:repoName/blob/:oid", repoController.getBlobContent);
repoRouter.get("/repo/:username/:repoName/zip", repoController.downloadZip);
repoRouter.post("/repo/:username/:repoName/edit", repoController.editFile);
repoRouter.post("/repo/:username/:repoName/merge", repoController.mergeBranches);
repoRouter.post("/repo/:username/:repoName/fork", repoController.forkRepo);

repoRouter.get("/user/invitations", repoController.getUserInvitations);

repoRouter.get("/repo/:username/:repoName/contributors", repoController.getRepoContributors);
repoRouter.post("/repo/:username/:repoName/contributors/invite", repoController.inviteContributor);
repoRouter.post("/repo/:username/:repoName/contributors/accept", repoController.acceptInvitation);
repoRouter.post("/repo/:username/:repoName/contributors/decline", repoController.declineInvitation);
repoRouter.delete("/repo/:username/:repoName/contributors/:contributorUsername", repoController.removeContributor);

repoRouter.get("/public/repos/:username", repoController.getPublicRepos);
repoRouter.get("/user/:username/repos", repoController.getPublicRepos);

repoRouter.get("/repo/:username/:repoName/security/scan", repoController.scanRepoSecrets);

module.exports = repoRouter;
