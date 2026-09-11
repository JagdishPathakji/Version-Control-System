const express = require("express")
const userRouter = express.Router()
const userController = require("../controllers/userController")

userRouter.get("/getAllUsers", userController.getAllUsers)

userRouter.post("/signup", userController.signup)
userRouter.post("/verifyEmail", userController.verifyEmail)
userRouter.post("/verifyToken", userController.verifyToken)
userRouter.post("/login", userController.login)
userRouter.post("/logout", userController.logout)
userRouter.get("/getUserProfile/:email", userController.getUserProfile)
userRouter.post("/getOwnProfile", userController.getOwnProfile)
userRouter.patch("/updateProfile", userController.updateProfile)
userRouter.delete("/deleteProfile", userController.deleteProfile)

// Public profile: support GET and POST, with or without :username param
userRouter.get("/getPublicProfile/:username", userController.getPublicProfile)
userRouter.post("/getPublicProfile/:username", userController.getPublicProfile)
userRouter.get("/getPublicProfile", userController.getPublicProfile)
userRouter.post("/getPublicProfile", userController.getPublicProfile)

// Follow: support PATCH and POST, with :username or body
userRouter.patch("/follower/:username", userController.follow)
userRouter.post("/follower/:username", userController.follow)
userRouter.post("/addAFollower/:username", userController.follow)
userRouter.patch("/addAFollower/:username", userController.follow)

module.exports = userRouter
