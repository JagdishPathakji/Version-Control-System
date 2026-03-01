const mongoose = require("mongoose")
const { Schema } = mongoose

const repoSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "My Repo Description"
    },
    content: [
        {
            type: Schema.Types.ObjectId,
            ref: "Content"
        }
    ],
    visibility: {
        type: String,
        default: "public",
        enum: ["public","private"]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    starred: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    driveId: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        required: true
    },
    readme: {
        type: String,
        default: ""
    }
}, {timestamps: true})

const Repository = mongoose.model("Repository", repoSchema)
module.exports = Repository
