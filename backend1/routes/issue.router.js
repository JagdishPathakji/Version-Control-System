const express = require("express")
const issueRouter = express.Router()
const issueController = require("../controllers/issueController")

issueRouter.post("/createIssue", issueController.createIssue)
issueRouter.put("/updateIssue/:id", issueController.updateIssueById)
issueRouter.delete("/deleteIssue/:id", issueController.deleteIssueById)
issueRouter.get("/getAllIssue", issueController.getAllIssue)

module.exports = issueRouter