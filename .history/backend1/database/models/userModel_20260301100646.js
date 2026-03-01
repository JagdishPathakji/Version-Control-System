const mongoose = require("mongoose")
const { Schema } = mongoose

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    repositories: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository"
        }
    ],
    followedUser: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    followingUser: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    starredRepo: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository"
        }
    ],
    description: {
        type: String,
        default: "My Description"
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema)
module.exports = User
