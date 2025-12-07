// const mongoose = require("mongoose")
// const { Schema } = mongoose

// const issueSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: {
//         type: String,
//         required: true,
//     },
//     status: {
//         type: String,
//         enum: ["open","closed"],
//         default: "open"
//     },
//     repository: {
//         type: Schema.Types.ObjectId,
//         required: true,
//         ref: "Repository"
//     }
// })

// const Issue = mongoose.model("Issue",issueSchema)
// module.exports = Issue