// Untracked files
// Files that exist in your working directory (project folder) but have never been added to staging or committed.

// Changes to be committed
// Files that are in the staging area (.jvcs/staging) — meaning, you’ve already added them using jvcs add, but haven’t committed yet.

// Changes not staged for commit
// Files that were already added to staging earlier, but you modified them again in your working directory after staging — i.e., the staged copy and working copy are different.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const chalk = require("chalk");
const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("./utility");

// normalize relative path to use forward slashes for consistent comparisons
function normalizeRel(p) {
    return p.split(path.sep).join("/")
}

function hashfile(filepath) {
    try {
        const data = fs.readFileSync(filepath)
        return crypto.createHash("sha256").update(data).digest("hex")
    }
    catch(error) {
        // return null
    }
}


function getAllFiles(dir, rootDir=dir, collected=[]) {

    if (!fs.existsSync(dir)) return collected;

    const entries = fs.readdirSync(dir,{withFileTypes:true})

    for(const entry of entries) {
        const fullPath = path.join(dir,entry.name)
        const rel = normalizeRel(path.relative(rootDir,fullPath))

        if(entry.isDirectory() && (entry.name === ".jvcs" || entry.name === "node_modules")) 
        continue;
        
        if(entry.isFile() && (entry.name === "meta.json" || entry.name === "jvcs_hashcode.json")) 
        continue;
        
        if(entry.isFile()) {
            collected.push(rel);
        }
        else if(entry.isDirectory()) {
            getAllFiles(fullPath, rootDir, collected);
        }

    }

    return collected
}

async function statusCmd() {

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

    const cwd = process.cwd()
    const jvcsDir = path.join(cwd,".jvcs")
    const commitDir = path.join(jvcsDir,"commits")
    const stagingDir = path.join(jvcsDir,"staging")
    const headFile = path.join(jvcsDir, "HEAD");

    if(!fs.existsSync(jvcsDir)) {
        console.log(chalk.red("No repository exists. Please create one using 'jvcs init'"))
        return
    }

    // collect files (all relative to cwd, normalized)
    const cwdFiles = getAllFiles(cwd, cwd, []);
    const stagedFiles = fs.existsSync(stagingDir) ? getAllFiles(stagingDir, stagingDir, []).map(f => normalizeRel(f)) : [];
    let commitedFiles = []
    if(fs.existsSync(commitDir)) {
        const commits = fs.readdirSync(commitDir)
        if(commits.length > 0) {
            const lastCommit = `${fs.readFileSync(headFile, "utf-8").trim()}`;
            const commitPath = path.join(commitDir, lastCommit);
            commitedFiles = getAllFiles(commitPath, commitPath, []).map(f => normalizeRel(f))
        }
    }

    // use Sets for fast looku
    const committedSet = new Set(commitedFiles);
    const stagedSet = new Set(stagedFiles);

    // Untracked: present in cwd but not in staging or commits
    const untracked = cwdFiles.filter(f => !stagedSet.has(f) && !committedSet.has(f));

    // Changes to be committed: present in staging but not in (any) commits
    const toBeCommitted = stagedFiles.filter(f => !committedSet.has(f));

    // Changes not staged for commit: present in staging and in cwd, but changed in cwd compared to staged copy
    const modified = stagedFiles.filter((file)=> {
        const cwdFilePath = path.join(process.cwd(),file)
        const stagedFilePath = path.join(stagingDir,file)
        
        if(!fs.existsSync(cwdFilePath) || !fs.existsSync(stagedFilePath))
        return false

        const cwdHash = hashfile(cwdFilePath)
        const stagingHash = hashfile(stagedFilePath)

        return cwdHash !== stagingHash
    })


    // output
    console.log(chalk.bold.blue(`\nOn branch: main (default)`));

    console.log(chalk.bold.green("\nChanges to be committed (files that are staged but not commited):"));
    if(toBeCommitted.length > 0) {
        toBeCommitted.forEach(f => console.log(chalk.green(`\t${f}`)));
    }
    else {
        console.log(chalk.gray("\tNo changes added to commit"));
    }

    console.log(chalk.bold.yellow("\nChanges not staged for commit (files that are modified after adding to staging area):"));
    if(modified.length > 0) {
        modified.forEach(f => console.log(chalk.yellow(`\t${f}`)));
    } 
    else {
        console.log(chalk.gray("\tNo modified files detected"));
    }

    console.log(chalk.bold.red("\nUntracked files (files that are not staged or commited):"));
    if(untracked.length > 0) {
        untracked.forEach(f => console.log(chalk.red(`\t${f}`)));
    }
    else {
        console.log(chalk.gray("\tNo untracked files"));
    }

    console.log(chalk.gray("\n(use 'jvcs add <file>' to stage changes)"));
    console.log(chalk.gray("(use 'jvcs commit -m \"message\"' to commit changes)"));
    console.log(chalk.gray("(use 'jvcs unstage <file>/<folder> to unstage a file/folder')"))
}

module.exports = statusCmd