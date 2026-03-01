const jwt = require("jsonwebtoken")
const Repository = require("../database/models/repoModel")
const User = require("../database/models/userModel")
const Content = require("../database/models/contentModel")
const getDriveClient = require("../config/drive-config.js")
const drive = getDriveClient()

const star = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Please login again" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const email = decoded.email;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).send({ status: false, message: "User not found" });

        const repo = await Repository.findById(req.params.repoId);
        if (!repo)
            return res.status(404).send({ status: false, message: "Repository not found" });

        // Ensure repo.starred is an array
        if (!Array.isArray(repo.starred)) repo.starred = [];

        const userId = user._id.toString();
        const hasStarred = repo.starred.includes(userId);

        if (hasStarred) {
            // Unstar
            repo.starred = repo.starred.filter((id) => id.toString() !== userId);
            await repo.save();
            return res.status(200).send({
                status: true,
                message: "Unstarred successfully",
                count: repo.starred.length,
                starred: false
            });
        }
        else {
            // Star
            repo.starred.push(userId);
            await repo.save();
            return res.status(200).send({
                status: true,
                message: "Starred successfully",
                count: repo.starred.length,
                starred: true
            });
        }
    }
    catch (error) {
        console.error("Star error:", error);
        return res.status(500).send({ status: false, message: "Internal server error" });
    }
};

const getFileContent = async (req, res) => {

    try {

        const { driveId } = req.params

        if (!driveId)
            return res.status(404).send({ status: false, message: "Drive id not sent, please try again", content: null })

        const token = req.cookies.token
        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found, Please Login again" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        // get the file content using drive code
        const response = await drive.files.get({
            fileId: driveId,
            alt: "media",
        }, { responseType: "stream" });

        let fileContent = "";
        await new Promise((resolve, reject) => {
            response.data
                .on("data", (chunk) => (fileContent += chunk))
                .on("end", resolve)
                .on("error", reject);
        });

        return res.status(200).send({
            status: true,
            message: "File content fetched successfully",
            content: fileContent,
        });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: "Internal server error", content: null })
    }
}

const createCLIRepo = async (req, res) => {

    try {
        const { reponame, driveId, parentId, content, token } = req.body

        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found." });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        }
        catch (err) {
            return res.status(401).send({ status: false, message: "Invalid or expired token." });
        }

        const email = decoded.email;

        if (!reponame || !driveId || !parentId || !content)
            return res.status(400).send({ status: false, message: "Not recieved all repository details" })

        if (!Array.isArray(content) || content.length === 0)
            return res.status(400).send({ status: false, message: "No commit content provided" });

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send({ status: false, message: "User not found" });


        let repo = await Repository.findOne({ name: reponame, owner: user._id });

        console.log(content)
        const contentDoc = await Promise.all(
            content.map(commit =>
                Content.create({
                    uuid: commit.uuid,
                    files: commit.files
                })
            )
        )

        if (repo) {
            if (contentDoc.length > 0) {
                repo.content = [...repo.content, ...contentDoc.map(doc => doc._id)]
                await repo.save()
            }
            if (!user.repositories.includes(repo._id)) {
                user.repositories.push(repo._id);
            }
            await user.save()
            return res.json({ status: true, message: "New Commits added successfully" });
        }

        const newRepo = await Repository.create({
            name: reponame,
            owner: user._id,
            driveId: driveId,
            parentId: parentId,
            content: contentDoc.map(doc => doc._id)
        });

        user.repositories.push(newRepo._id)
        await user.save()
        return res.json({ status: true, message: "Repository created successfully" });
    }
    catch (error) {
        console.error("Error in createCLIRepo:", error);
        res.status(500).send({ status: false, message: "Internal server error in creating repo from CLI" })
    }
}

const deleteCommit = async (req, res) => {

    try {

        const { username, email, token, toDelete, reponame } = req.body

        if (!username || !email || !token)
            return res.status(400).send({ status: false, message: "User details not obtained. Please login again" })

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        }
        catch (err) {
            return res.status(401).send({ status: false, message: "Invalid or expired token. Please login again." });
        }

        const user = await User.findOne({ email: email, username: username });
        if (!user) return res.status(404).send("User not found");

        // we push commits only when user applies push command. if before he applies revert, repo data doesn't exists in database
        // maybe that's also okay for us ????
        const repo = await Repository.findOne({ name: reponame, owner: user._id }).populate("content");
        if (!repo) return res.status(200).send({ status: true, message: `No repo ${reponame} exists — likely not pushed yet, so skipping DB cleanup.`, });

        if (!Array.isArray(toDelete) || toDelete.length === 0)
            return res.status(400).send({ status: false, message: "No commits specified to delete" });

        for (const commitId of toDelete) {
            await Content.deleteOne({ uuid: commitId });
            repo.content = repo.content.filter((c) => c.uuid !== commitId);
        }

        await repo.save();
        return res.status(200).send({
            status: true,
            message: `Deleted ${toDelete.length} commits from repo ${reponame}`,
        });

    }
    catch (error) {
        return res.status(500).send({ status: false, message: "Internal server error in deleting previous commits" })
    }
}

const cloneRepo = async (req, res) => {

    try {

        const { username, reponame, token } = req.body

        if (!username || !reponame)
            return res.status(400).send({ status: false, message: "username and reponame not provided for cloning" })

        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found, Please Login again" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const email = decoded.email

        const user = await User.findOne({ email })
        if (!user) return res.status(404).send({ status: false, message: "User not found" });

        const repo = await Repository.findOne({ name: reponame }).populate("owner").populate("content")

        if (!repo)
            return res.status(404).send({ status: false, message: "No such repository exists" })

        if (repo.visibility === "private") {
            if (repo.owner._id.toString() !== user._id.toString()) {
                return res.status(403).send({ status: false, message: "Cannot clone private repository of a user" })
            }
        }

        if (!repo.content || repo.content.length === 0) {
            return res.status(200).send({ status: false, message: "Repository found but has no content yet" })
        }

        const latestCommit = repo.content.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0]

        return res.status(200).send({ status: true, message: "Repository and latest content fetched successfully", commitId: latestCommit.uuid })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: "Internal server error during cloning repository" })
    }
}

const createRepo = async (req, res) => {

    try {
        console.log("Inside repo create")

        const repoData = req.body
        const requiredFields = ["name"]

        // check if all the required fields are present or not
        const allFieldsPresent = requiredFields.every((field) => repoData[field])
        if (!allFieldsPresent)
            return res.status(400).send("Please fill all the required fields")

        const token = req.cookies.token
        if (!token)
            return res.status(401).send("Unauthorized: Token not found, Please Login again");

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decoded)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send("User not found");

        console.log(user)

        const repoAlreadyExists = await Repository.findOne({ name: repoData.name, owner: user._id })
        if (repoAlreadyExists)
            res.status(409).send(`repo with ${repoData.name} already exists. Please select unique name`)

        repoData.owner = user._id;
        const repo = await Repository.create(repoData)

        console.log(repo)
        user.repositories.push(repo._id)
        await user.save()

        return res.status(201).send("Repository Created Successfully")
    }
    catch (error) {
        res.status(500).send("Internal Server error in creating repository")
    }
}

const getAllRepo = async (req, res) => {
    try {
        const token = req.cookies.token
        if (!token)
            return res.status(401).send({ status: "login", message: "Unauthorized: Token not found, Please Login again" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decoded)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).send({ status: "login", message: "User not found" });

        const allRepos = await Repository.find({
            visibility: "public",
            owner: { $ne: user._id }
        });

        if (allRepos.length)
            res.status(200).json({ data: allRepos, status: true })
        else
            res.status(200).json({ data: [], status: true })
    }
    catch (error) {
        res.status(500).send({ status: "login", message: "Internal server error occured in getting all repos" })
    }
}

const getRepoByName = async (req, res) => {

    try {

        const token = req.cookies.token
        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found, Please Login again" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send({ status: false, message: "User not found" });


        const reponame = req.params.reponame
        if (!reponame)
            return res.status(404).send({ status: false, message: "Reponame is not provided" })

        const repo = await Repository.findOne({ name: reponame, owner: user._id })
            .populate({
                path: "content",
            })

        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });

        const repoObj = repo.toObject();
        const userId = user._id.toString();

        const starredArray = Array.isArray(repoObj.starred) ? repoObj.starred.map(id => id.toString()) : [];
        const isStarredByUser = starredArray.includes(userId);
        const starCount = starredArray.length;

        delete repoObj.starred;

        return res.status(200).json({
            status: true,
            repoObj: { ...repoObj, starCount, isStarredByUser },
        });
    }
    catch (error) {
        res.status(500).send({ status: false, message: "Internal server error in getting repo by name" })
    }
}

const getPublicRepoByName = async (req, res) => {

    try {
        const token = req.cookies.token
        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found, Please Login again" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send({ status: false, message: "User not found" });


        const reponame = req.params.reponame
        if (!reponame)
            return res.status(404).send({ status: false, message: "Reponame is not provided" })

        const repo = await Repository.findOne({ name: reponame, visibility: "public" })
            .populate({
                path: "content",
            })
            .populate({
                path: "owner",
                select: "username email", // only minimal info
            });


        if (!repo) return res.status(404).json({ status: false, message: "Repository not found" });


        const repoObj = repo.toObject();
        const userId = user._id.toString();

        const starredArray = Array.isArray(repoObj.starred) ? repoObj.starred.map(id => id.toString()) : [];
        const isStarredByUser = starredArray.includes(userId);
        const starCount = starredArray.length;

        delete repoObj.starred;

        return res.status(200).json({
            status: true,
            repoObj: { ...repoObj, starCount, isStarredByUser },
        });
    }
    catch (error) {
        res.status(500).send({ status: false, message: "Internal server error in getting repo by name" })
    }
}

const fetchRepoForCurrentUser = async (req, res) => {

    try {
        const token = req.cookies.token
        if (!token)
            return res.status(401).send({ status: "login", message: "Unauthorized: Token not found, Please Login again" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decoded)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).send({ status: "login", message: "User not found" });

        console.log(user)
        const userId = user._id

        const allRepo = await Repository.find({ owner: userId })
        if (allRepo.length) {
            return res.status(200).json({ status: "present", data: allRepo })
        }
        else {
            allRepo.status = "absent"
            return res.status(200).send({ status: "absent", data: allRepo })
        }
    }
    catch (error) {
        res.status(500).send({ status: "login", message: "Internal server error in fetching repos for current user" })
    }
}

const deleteRepo = async (req, res) => {

    try {

        const token = req.cookies.token
        if (!token)
            return res.status(401).send("Unauthorized: Token not found, Please Login again");

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decoded)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send("User not found");

        console.log(user)

        const reponame = req.params.reponame
        console.log(reponame)
        const repo = await Repository.findOne({ name: reponame, owner: user._id });

        if (!repo)
            return res.status(404).send("Repository not found or not owned by this user");

        console.log(repo)

        await Repository.deleteOne({ _id: repo._id });

        user.repositories = user.repositories.filter((repoId) => {
            repoId.toString() !== repo._id.toString()
        })

        await user.save()

        return res.status(200).send(`Repository '${reponame}' deleted successfully`);
    }
    catch (error) {
        res.status(500).send("Internal server error in delete repo")
    }
}

const updateRepo = async (req, res) => {
    try {
        const { reponame } = req.params;
        const { description, readme } = req.body; // Accept readme
        const token = req.cookies.token;
        
        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const email = decoded.email;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).send({ status: false, message: "User not found" });

        // Build update object dynamically
        const updateData = {};
        if (description !== undefined) updateData.description = description;
        if (readme !== undefined) updateData.readme = readme;

        const repo = await Repository.findOneAndUpdate(
            { name: reponame, owner: user._id },
            updateData,
            { new: true }
        );

        if (!repo) return res.status(404).send({ status: false, message: "Repository not found or not owned by you" });

        return res.status(200).send({ 
            status: true, 
            message: "Repository updated successfully", 
            description: repo.description,
            readme: repo.readme // Return updated readme
        });
    }
    catch (error) {
        console.error("Update repo error:", error);
        res.status(500).send({ status: false, message: "Internal server error in repository update" });
    }
}


const updateVisbility = async (req, res) => {

    try {

        const token = req.cookies.token
        if (!token)
            return res.status(401).send({ status: false, message: "Unauthorized: Token not found, Please Login again" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decoded)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send({ status: false, message: "User not found" });

        const reponame = req.params.reponame

        if (!reponame)
            return res.status(400).send({ status: false, message: "Please provide repository name and new visibility" });

        const repo = await Repository.findOne({ name: reponame, owner: user._id });
        if (!repo)
            return res.status(404).send("Repository not found or not owned by this user");

        if (repo.visibility === "public") {
            repo.visibility = "private"
        }
        else {
            repo.visibility = "public"
        }
        await repo.save();

        return res.status(200).send({ status: true, message: "Visibilitiy updated successfully", visibility: repo.visibility })
    }
    catch (error) {
        res.status(500).send("Internal server error in update visibility")
    }
}

module.exports = {
    createRepo,
    getAllRepo,
    getRepoByName,
    fetchRepoForCurrentUser,
    deleteRepo,
    updateRepo,
    updateVisbility,
    createCLIRepo,
    getPublicRepoByName,
    deleteCommit,
    cloneRepo,
    getFileContent,
    star
}
