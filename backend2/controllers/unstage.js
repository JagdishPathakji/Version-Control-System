const fs = require("fs").promises;
const fssync = require("fs");
const path = require("path");
const chalk = require("chalk");
const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("./utility");

function removeHashesForFolder(hashData,folderPath) {

    for(const key of Object.keys(hashData)) {
        if(key.startsWith(folderPath+path.sep)) {
            delete hashData[key]
        }
    }
}

async function unstageCmd(paths) {

    if(!paths || paths.length === 0) {
        console.log(chalk.yellow("Please specify files or folders to unstage."));
        return;
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

    if(!checkforjvcs()) {
        console.log(chalk.red("Repository is not initialized or is deleted."));
        return;
    }

    const repoPath = path.join(process.cwd(), ".jvcs");
    const stagingPath = path.join(repoPath, "staging");
    const hashPath = path.join(stagingPath, "jvcs_hashcode.json");

    if(!fssync.existsSync(stagingPath)) {
        console.log(chalk.yellow("Nothing is staged yet."));
        return;
    }

    const stagedItems = fssync.readdirSync(stagingPath).filter((item)=> item !== "jvcs_hashcode.json")
    if(stagedItems.length === 0) {
        console.log(chalk.yellow("Staging area is empty. Nothing to unstage."));
        return;
    }

    let hashData = {};
    if(fssync.existsSync(hashPath)) {
        hashData = JSON.parse(await fs.readFile(hashPath, "utf-8"));
    }

    if(paths.length === 1 && paths[0] === ".") {
        await fs.rm(stagingPath, {recursive: true, force: true})
        await fs.mkdir(stagingPath, {recursive: true})
        console.log(chalk.cyan("Unstaged all files and folders."));
        return
    }

    const targets = paths.map((p) => path.resolve(process.cwd(), p));

    for(const target of targets) {

        const stagedTarget = path.join(stagingPath, path.relative(process.cwd(),target))

        if(!fssync.existsSync(stagedTarget)) {
            console.log(chalk.yellow(`Not found in staging: ${path.relative(process.cwd(), target)}`));
            continue;
        }

        const stats = await fs.stat(stagedTarget);

        if(stats.isDirectory()) {
            await fs.rm(stagedTarget, {recursive: true, force: true})
            removeHashesForFolder(hashData,path.relative(process.cwd(),target))
            console.log(chalk.cyan(`Unstaged folder: ${path.relative(process.cwd(), target)}`));
        }
        else if(stats.isFile()) {
            await fs.rm(stagedTarget)
            delete hashData[path.relative(process.cwd(),target)]
            console.log(chalk.green(`Unstaged file: ${path.relative(process.cwd(), target)}`));
        }

    }

    if(Object.keys(hashData).length === 0) {
        if(fssync.existsSync(hashPath)) {
            await fs.rm(hashPath)
        }
    }
    else {
        await fs.writeFile(hashPath,JSON.stringify(hashData,null,2))
    }

}

module.exports = unstageCmd