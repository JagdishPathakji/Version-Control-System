const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        enum: ["contributor", "admin"],
        default: "contributor"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    invitedAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: {
        type: Date
    }
}, { _id: true });

const repoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: "",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    contributors: [contributorSchema],
    isPrivate: {
        type: Boolean,
        default: false,
    },
    s3Prefix: {
        type: String,
        required: true,
    },
    isFork: {
        type: Boolean,
        default: false,
    },
    forkedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repository",
        default: null,
    },
    forkCount: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

// Ensure a user cannot have two repos with the exact same name
repoSchema.index({ name: 1, owner: 1 }, { unique: true });
repoSchema.index({ "contributors.user": 1, "contributors.status": 1 });

module.exports = mongoose.model("Repository", repoSchema);

