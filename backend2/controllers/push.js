const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const { getDriveClient } = require("../config/drive-config")
const drive = getDriveClient()
const { getGlobalConfig, checkGlobalConfig, checkforjvcs } = require("./utility")
const getDirectoryStructure = require("./driveUtility")
const handleDbForRepo = require("../apicall/handleDbForRepo")




async function uploadFile(localFile, parentId,data) {

    try {

        const fileName = path.basename(localFile)
        const fileMetaData = {
            name: fileName,
            parents: [parentId]
        }

        const media = {
            mimeType: "application/octet-stream",
            body: fs.createReadStream(localFile),
        }

        const res = await drive.files.create({
            resource: fileMetaData,
            media,
            fields: "id"
        })

        console.log(chalk.gray(`   ↳ Uploaded: ${fileName}`));
        data.files.push({name:fileName,driveId:res.data.id,parentId:parentId,type:"file"})
        return res.data.id;
    }
    catch(error) {
        console.log(chalk.red(`Failed to upload ${filePath}: ${err.message}`));
    }
}

async function uploadDirectory(localDir, parentId,data) {

    const entries = fs.readdirSync(localDir, {withFileTypes: true})

    for(const entry of entries) {

        const entryPath = path.join(localDir,entry.name)

        if(entry.isDirectory()) {
            const folderMeta = {
                name: entry.name,
                mimeType: "application/vnd.google-apps.folder",
                parents: [parentId],
            }

            const folder = await drive.files.create({
                resource: folderMeta,
                fields: "id"
            })

            data.files.push({name:entry.name,driveId:folder.data.id,parentId:parentId,type:"folder"})
            await uploadDirectory(entryPath,folder.data.id,data)
        }
        else {
            await uploadFile(entryPath,parentId,data)
        }
    }
}

async function pushCmd() {

    try {

        let userFolderId,repoFolderId

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
        
        const cwd = process.cwd()
        const jvcsDir = path.join(cwd,".jvcs")
        const commitDir = path.join(jvcsDir,"commits")
        const reponame = path.basename(process.cwd())

        if(!fs.existsSync(commitDir)) {
            console.log(chalk.yellow("No commits to push"))
            return
        }

        // storing the name of commit folders
        const commitFolders = fs.readdirSync(commitDir, {withFileTypes: true}).filter((e)=> e.isDirectory()).map((e)=> e.name)
        if(commitFolders.length === 0) {
            console.log(chalk.yellow('No commits to push'))
            return
        }

        console.log(chalk.blue("Pushing commits of ",reponame," to cloud storage..."))
        
        const Content = []
        for(const commitId of commitFolders) {
            let data = {}
            data.files = []
            data.uuid = commitId
            const commitFolder = path.join(commitDir,commitId)
            const metaPath = path.join(commitFolder,"meta.json")

            if(!fs.existsSync(metaPath)) {
                console.log(chalk.yellow(`Skipping ${commitId} (no meta.json found)`));
                continue;
            }

            const metaData = JSON.parse(fs.readFileSync(metaPath,"utf-8"))
            const { author, message, timeStamp } = metaData;

            console.log(chalk.green(`\n Uploading commit:`));
            console.log(chalk.gray(`   id: ${commitId}`));
            console.log(chalk.gray(`   message: ${message}`));
            console.log(chalk.gray(`   author: ${author}`));
            console.log(chalk.gray(`   time: ${timeStamp}`));

            const folderStructure = await getDirectoryStructure(configData.username,reponame,commitId)
            const driveCommitId = folderStructure.commitFolderId;
            repoFolderId = folderStructure.repoFolderId;
            userFolderId = folderStructure.userFolderId;
            const commitAlreadyExists = folderStructure.commitAlreadyExists;

            if (commitAlreadyExists) {
                console.log(chalk.yellow(`Skipping ${commitId} (already uploaded)`));
                continue;
            }

            await uploadDirectory(commitFolder,driveCommitId,data)
            console.log(chalk.green(`Commit ${commitId} uploaded successfully!`));
            Content.push(data)
        }
        
        console.log(chalk.bold.green("\nAll commits pushed successfully!"));

        // database call for creating/updating an repository
        await handleDbForRepo(reponame,repoFolderId,userFolderId,Content,configData.token)
    }
    catch(error) {
        console.log(chalk.red.bold("\nPush Failed"));
        console.error(chalk.red(error.stack || error.message || error));
    }
}

module.exports = pushCmd