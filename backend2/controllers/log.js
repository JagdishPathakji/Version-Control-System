const fssync = require("fs");
const path = require("path");
const chalk = require("chalk");
const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("./utility");

async function logCmd() {

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

    const repoPath = path.join(process.cwd(),".jvcs")
    const commitPath = path.join(repoPath,"commits")
    const headPath = path.join(repoPath,"HEAD")

    if(!fssync.existsSync(headPath)) {
        console.log(chalk.yellow("No commits yet."));
        return;
    }

    if(!fssync.existsSync(commitPath)) {
        console.log(chalk.yellow("No commits found. Try commiting first"))
        return
    }
    
    const commitDir = fssync.readdirSync(commitPath)
    if(commitDir.length === 0) {
        console.log(chalk.yellow("No commits found. Try commiting first"))
        return
    }

    const currentHead = fssync.readFileSync(headPath,"utf-8").trim()
    if(!currentHead) {
        console.log(chalk.yellow("HEAD is empty. No commits to display."));
        return;
    }

    console.log(chalk.bold.cyan("\n=========================== Commit History ====================\n"));

    let commitId = currentHead
    const chains = []

    while(commitId) {
        const commitFolder = path.join(commitPath,commitId)
        const metaPath = path.join(commitFolder,"meta.json")

        if (!fssync.existsSync(metaPath)) {
            console.log(chalk.red(`Missing metadata for commit: ${commitId}`));
            break;
        }

        const metaData = JSON.parse(fssync.readFileSync(metaPath,"utf-8"))
        console.log('\t',chalk.yellow(`commit ${metaData.id}`));
        console.log('\t',chalk.green(`Author:`), metaData.author || "Unknown");
        console.log('\t',chalk.cyan(`Date:`), new Date(metaData.timeStamp).toLocaleString());
        console.log('\t',chalk.white(`\n\t\t${metaData.message}\n`));

        chains.push(metaData.id)
        commitId = metaData.parentId
    }

    console.log(chalk.magenta("\n=================Visual Representation for commits==============\n"))

    console.log(chalk.cyan.bold("\n   HEAD"));
    console.log(chalk.cyan("    ↓\n"));

    let chainLine = "";

    for (let i = 0; i < chains.length; i++) {
        const id = chains[i].substring(0, 8); // short commit ID
        chainLine += chalk.green(id);

        if (i !== chains.length - 1) {
            chainLine += chalk.cyan("  →  ");
        } else {
            chainLine += chalk.gray("  →  NULL");
        }
    }

    console.log(chainLine);
    console.log();

    console.log(chalk.bold.cyan("=================================================================\n"));
}

module.exports = logCmd