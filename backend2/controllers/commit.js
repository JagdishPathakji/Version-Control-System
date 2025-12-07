const path = require("path");
const fs = require("fs").promises;
const fssync = require("fs");
const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("./utility");

async function commitCmd(message) {
    
    if (!message || !message.trim()) {
        console.log(chalk.yellow("Please provide a commit message."));
        return;
    }

    if(!checkGlobalConfig()) {
        console.log(chalk.red("No existing session found. Please login or signup."))
        console.log(chalk.green("jvcs --help for help"))
        return
    }

    let configData = getGlobalConfig()

    if(!configData) {
        console.log(chalk.red("No existing session found. Please login or signup."))
        console.log(chalk.green("jvcs --help for help"))
        return
    }

    if(!checkforjvcs()) {
        console.log(chalk.red("Repository is not initialized or is deleted. Please create it."))
        return
    }

    const repoPath = path.join(process.cwd(),".jvcs")
    const staging = path.join(repoPath,"staging")
    const commits = path.join(repoPath,"commits")

    if(!fssync.existsSync(staging)) {
        console.log(chalk.yellow("Nothing to commit — staging area is empty."))
        return
    }

    const stagedContent = await fs.readdir(staging)
    if(stagedContent.length === 0) {
        console.log(chalk.yellow("Nothing to commit — staging area is empty."))
        return
    }


    if(!fssync.existsSync(commits)) {
        await fs.mkdir(commits)
    }

    // main commit logic
    const commitId = uuidv4()
    const commitFolder = path.join(commits,commitId)
    await fs.mkdir(commitFolder, {recursive: true})

    // copying the staging area content to commit folder
    await fs.cp(staging,commitFolder, {recursive: true})

    // saving metadata of commit
    let parentId = null;
    const headPath = path.join(repoPath, "HEAD");
    if (fssync.existsSync(headPath)) {
        parentId = (await fs.readFile(headPath, "utf8")).trim() || null;
    }

    const meta = {
        author: configData.username || "unknown",
        id: commitId,
        message,
        timeStamp: new Date().toISOString(),
        parentId
    }

    await fs.writeFile(path.join(commitFolder,"meta.json"),JSON.stringify(meta,null,2))

    await fs.writeFile(path.join(repoPath, "HEAD"), commitId);
    console.log(chalk.green(`Committed as ${commitId}: "${message}"`));
}

module.exports = commitCmd