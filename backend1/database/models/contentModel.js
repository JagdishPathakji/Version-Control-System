const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema for a file
const fileSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    driveId: {
        type: String,
        required: true,
    },
    parentId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["file","folder"]
    }
})

const contentSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
    },
    files: [fileSchema] // top-level files/folders
}, { timestamps: true });

const Content = mongoose.model("Content", contentSchema);
module.exports = Content;