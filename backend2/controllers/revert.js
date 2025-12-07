const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("./utility");
const { getDriveClient } = require("../config/drive-config");


function copyDir(targetCommitFolder, destDir=process.cwd()) {

    const entries = fs.readdirSync(targetCommitFolder, {withFileTypes: true})
    
    for(const entry of entries) {
        
        if (entry.name === ".jvcs") continue;
        
        const srcpath = path.join(targetCommitFolder,entry.name)
        const destpath = path.join(destDir,entry.name)

        if(entry.isDirectory()) {
            fs.mkdirSync(destpath, { recursive: true });
            copyDir(srcpath, destpath);
        }
        else {
            if(entry.name !== "meta.json" && entry.name !== "jvcs_hashcode.json")
            fs.copyFileSync(srcpath, destpath);
        }
    }
}

function cleanCWD() {

    const cwd = process.cwd()
    const entries = fs.readdirSync(cwd, {withFileTypes: true})

    for(const entry of entries) {
        if(entry.name === ".jvcs") continue
        const deleteEntry = path.join(cwd,entry.name)
        fs.rmSync(deleteEntry, {recursive: true, force: true})
    }
}

function buildCommitMap(commitFolder) {

    const map = {}
    const dirs = fs.readdirSync(commitFolder)
    for(const dir of dirs) {
        const metaPath = path.join(commitFolder,dir,"meta.json")
        if(fs.existsSync(metaPath)) {
            const data = JSON.parse(fs.readFileSync(metaPath,"utf-8"))
            map[dir] = data.parentId
        }
    }

    return map
}

function getCommitsToDelete(commitFolder,currentCommit,targetCommit) {

    const commitMap = buildCommitMap(commitFolder)
    console.log("Commit Map:", commitMap); // 👈 debug log
    const toDelete = []

    while(currentCommit && currentCommit !== targetCommit) {
        toDelete.push(currentCommit)
        currentCommit = commitMap[currentCommit] || null
    }

    return toDelete
}

function deleteLocalCommits(commitDir,Ids) {

    for(const id of Ids) {
        const p = path.join(commitDir,id)
        fs.rmSync(p, {recursive: true, force: true})
        console.log(chalk.red(`Deleted local commit ${id}`))
    }
}

async function deleteCommitsFromDrive(ids) {

    const drive = getDriveClient();

    if (!drive) {
        console.log(chalk.red("Drive client not initialized. Please re-authenticate."));
        return;
    }

    let folderName = null
    try {
        for(const id of ids) {
            folderName = `commit_${id}`
            
            const res = await drive.files.list({
                q: `name='${folderName}' and trashed=false`,
                fields: "files(id,name)"
            })
            
            if(res.data.files.length > 0) {
                const fileId = res.data.files[0].id;
                await drive.files.delete({fileId})
                console.log(chalk.red(`Deleted folder ${folderName} from remote`));
            }
            else {
                console.log(chalk.gray(`Drive folder ${folderName} not found.`));
            }
        }
    }
    catch(error) {
        console.log(chalk.red(`Failed to delete ${folderName} from remote: ${error.message}`));
    }
}

async function deleteCommitsFromDatabase(configData,toDelete,reponame) {

    try {

        const response = await fetch("https://version-control-system-mebn.onrender.com/deleteCommit", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token:configData.token,email:configData.email,username:configData.username,toDelete,reponame})
        })

        const data = await response.json()

        if(data.status === true) {
            console.log(chalk.green("Removed previous commits from DB"))
        }
        else {
            console.log(chalk.red(data.message))
        }
    }
    catch(error) {
        console.log(chalk.red(error || error.message))
    }
}

async function revertCmd(commitId) {

    if(!checkGlobalConfig()) {
        console.log(chalk.red("No existing session found. Please login or signup."));
        console.log(chalk.green("jvcs --help for help"));
        return;
    }
    
    const configData = getGlobalConfig();
    if(!configData) {
        console.log(chalk.red("No existing session found. Please login or signup."));
        return;
    }
    
    if(!checkforjvcs()) {
        console.log(chalk.red("Repository is not initialized or is deleted."));
        return;
    }
    
    // actual implementation
    const cwd = process.cwd()
    const jvcsDir = path.join(cwd,".jvcs")
    const commitFolder = path.join(jvcsDir,"commits")
    const targetCommitFolder = path.join(commitFolder,commitId)
    const headFile = path.join(jvcsDir,"HEAD")

    if(!fs.existsSync(jvcsDir)) {
        console.log(chalk.red("Repository is not initialized or is deleted."));
        return;
    }

    if(!fs.existsSync(commitFolder)) {
        console.log(chalk.red("You have made no commits yet. Revert not possible"))
        return
    }

    if(!fs.existsSync(targetCommitFolder)) {
        console.log(chalk.red("No commit exists with commit Id : ",commitId))
        return
    }   

    
    const currentHead = fs.readFileSync(headFile,"utf-8").trim()

    if(currentHead === commitId) {
        console.log(chalk.green("HEAD is already at the given commit"))
        return
    }

    // get commits to delete
    const toDelete = getCommitsToDelete(commitFolder,currentHead,commitId)

    // clear the current working directory except .jvcs
    cleanCWD()

    // copy the content of commit to cwd
    copyDir(targetCommitFolder)

    fs.writeFileSync(headFile,commitId,"utf-8")
    console.log(chalk.green(`HEAD moved to ${commitId}`));

    deleteLocalCommits(commitFolder,toDelete)
    await deleteCommitsFromDrive(toDelete)
    await deleteCommitsFromDatabase(configData,toDelete,path.basename(process.cwd()))

    console.log(chalk.green(`Successfully reverted to commit ${commitId}`));
}

module.exports = revertCmd