const express = require("express")
const userRouter = express.Router()
const userController = require("../controllers/userController")

userRouter.get("/getAllUsers", userController.getAllUsers)
userRouter.get("/getStreak/:username", userController.getStreak)
userRouter.post("/signup", userController.signup)
userRouter.post("/verifyEmail",userController.verifyEmail)
userRouter.post("/verifyToken",userController.verifyToken)
userRouter.post("/login", userController.login)
userRouter.post("/logout", userController.logout)
userRouter.get("/getUserProfile/:email", userController.getUserProfile)
userRouter.post("/getOwnProfile", userController.getOwnProfile)
userRouter.patch("/updateProfile", userController.updateProfile) //  // leftout
userRouter.delete("/deleteProfile", userController.deleteProfile)
userRouter.post("/getPublicProfile/:username", userController.getPublicProfile)
userRouter.patch("/follower/:username", userController.follow)

module.exports = userRouter