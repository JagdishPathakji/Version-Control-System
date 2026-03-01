const express = require("express")
const repoRouter = express.Router()
const repoController = require("../controllers/repoController")

repoRouter.post("/createRepo", repoController.createRepo)
repoRouter.post("/cloneRepo", repoController.cloneRepo)
repoRouter.post("/createCLIRepo", repoController.createCLIRepo)
repoRouter.post("/deleteCommit", repoController.deleteCommit)
repoRouter.get("/getAllRepo", repoController.getAllRepo)
repoRouter.get("/getRepoByName/:reponame", repoController.getRepoByName)
repoRouter.get("/getPublicRepoByName/:reponame", repoController.getPublicRepoByName)
repoRouter.get("/fetchRepoForCurrentUser", repoController.fetchRepoForCurrentUser)
repoRouter.patch("/updateRepo/:reponame", repoController.updateRepo)
repoRouter.patch("/updateVisibility/:reponame", repoController.updateVisbility)
repoRouter.delete("/deleteRepo/:reponame", repoController.deleteRepo)
repoRouter.get("/getFileContent/:driveId", repoController.getFileContent)
repoRouter.patch("/star/:repoId", repoController.star)

module.exports = repoRouter