const express = require("express");
const repoRouter = express.Router();
const repoController = require("../controllers/repoController");

repoRouter.post("/repo/create", repoController.createRepo);
repoRouter.get("/user/repos", repoController.getUserRepos);

repoRouter.get("/repo/:username/:repoName", repoController.getRepoDetails);
repoRouter.get("/repo/:username/:repoName/branches", repoController.getRepoBranches);
repoRouter.get("/repo/:username/:repoName/files", repoController.getRepoFiles);
repoRouter.get("/repo/:username/:repoName/commits", repoController.getRepoCommits);
repoRouter.get("/repo/:username/:repoName/blob/:oid", repoController.getBlobContent);
repoRouter.post("/repo/:username/:repoName/edit", repoController.editFile);
repoRouter.post("/repo/:username/:repoName/merge", repoController.mergeBranches);

repoRouter.get("/public/repos/:username", repoController.getPublicRepos);
repoRouter.get("/admin/cleanup", repoController.adminCleanup);

module.exports = repoRouter;
