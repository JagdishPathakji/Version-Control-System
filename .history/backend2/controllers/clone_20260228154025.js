const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { checkGlobalConfig, getGlobalConfig } = require("./utility");
const { getDriveClient } = require("../config/drive-config");
const drive = getDriveClient()

async function findFolderIdByName(name,parentId=null) {

    const safeName = name.replace(/'/g, "\\'");
    const parts = [`name='${safeName}'`, "trashed=false"];
    if (parentId) parts.push(`'${parentId}' in parents`);

    const q = parts.join(" and ");
    const res = await drive.files.list({
        q,
        fields: "files(id, name)",
    });

    const files = (res.data && res.data.files) || [];
    if (files.length === 0) return null;
    return files[0].id;
}   

async function downloadFolderFromDrive(folderId, destPath) {
    try {
        fs.mkdirSync(destPath, { recursive: true });

        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: "files(id, name, mimeType)",
        });

        const files = res.data.files;
        if(!files.length) return;

        for(const file of files) {

            if(file.name === "jvcs_hashcode.json" || file.name === "meta.json")
            continue

            const filePath = path.join(destPath, file.name);

            if(file.mimeType === "application/vnd.google-apps.folder") {
                // create folder locally
                if(!fs.existsSync(filePath)) fs.mkdirSync(filePath);
                await downloadFolderFromDrive(file.id, filePath);
            } 
            else {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                const dest = fs.createWriteStream(filePath);
                const resFile = await drive.files.get(
                    { fileId: file.id, alt: "media" },
                    { responseType: "stream" }
                )

                await new Promise((resolve,reject)=> {
                    resFile.data.on("end", resolve)
                    .on("error",reject)
                    .pipe(dest)
                })
            }

            console.log(chalk.gray(`Downloaded: ${file.name}`));
        }
    } 
    catch (err) {
        console.log(chalk.red("Error downloading folder: " + err.message));
    }
}


async function getVisibilityAndLatestCommit(username,reponame,configData) {

    try {

        const response = await fetch("https://version-control-system-mebn.onrender.com/cloneRepo", {
            method:"POST",
            headers: {
                'Content-Type':"application/json"
            },
            body: JSON.stringify({username,reponame,token:configData.token})
        })

        const data = await response.json()
        return data
    }
    catch(error) {
        console.log(chalk.red(error || error.message))
    }
}

async function cloneCmd(username,reponame) {

    if(!username || !reponame) {
        console.log(chalk.red("Path is not provided properly"))
        return
    }   

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

    console.log(username,reponame)
    
    const response = await getVisibilityAndLatestCommit(username,reponame,configData)
    if(response.status === false) {
        console.log(chalk.red(`${response.message}`))
        return
    }

    const latestCommit = response.commitId
    // find the repo from drive GithubClone/username/reponame/commit_lastestCommit

    const rootFolder = await findFolderIdByName("GithubClone")
    if(!rootFolder) throw new Error("Root folder not found on cloud.");

    const userFolder = await findFolderIdByName(username, rootFolder);
    if (!userFolder) throw new Error(`User folder '${username}' not found.`);

    const repoFolder = await findFolderIdByName(reponame, userFolder);
    if (!repoFolder) throw new Error(`Repository folder '${reponame}' not found.`);

    const commitFolder = await findFolderIdByName(`commit_${latestCommit}`, repoFolder);
    if (!commitFolder) throw new Error(`Commit folder 'commit_${latestCommit}' not found.`);

    console.log(chalk.green(`Found repository, downloading...`));

    const destPath = path.join(process.cwd(), reponame);
    if(fs.existsSync(destPath)) {
        console.log(chalk.red(`Destination '${reponame}' already exists. Remove or rename it and retry.`));
        return;
    }

    await downloadFolderFromDrive(commitFolder, destPath);
    
    console.log(chalk.green(`Repository cloned successfully into ./${reponame}`));
}

module.exports = cloneCmd