const createIssue = (req,res)=> {
    res.send("Issue created")
}

const updateIssueById = (req,res)=> {
    res.send("Issue Updated")
}

const deleteIssueById = (req,res)=> {
    res.send("Issue deleted")
}

const getAllIssue = (req,res)=> {
    res.send("All Issues Fetched")
}

const getIssueById = (req,res)=> {
    res.send("Issue fetched by id")
}

module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssue,
    getIssueById
}