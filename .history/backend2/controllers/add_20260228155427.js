const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("./utility")
const path = require("path")
const fssync = require("fs")
const chalk = require("chalk")
const fs = require("fs").promises
const crypto = require("crypto")
const { minimatch } = require("minimatch")


async function getFileHash(filepath) {
    const buffer = await fs.readFile(filepath)
    return crypto.createHash("sha256").update(buffer).digest("hex")
}



async function hashDirectoryRecursive(dir,hashData) {

    const entries = await fs.readdir(dir, {withFileTypes: true})

    for(const entry of entries) {

        const fullPath = path.join(dir,entry.name)
        const relativePath = path.relative(process.cwd(),fullPath)

        if(entry.isFile()) {
            const hash = await getFileHash(fullPath)
            hashData[relativePath] = {
                hash,
                time: new Date().toISOString(),
            }
        }
        else if(entry.isDirectory()) {
            await hashDirectoryRecursive(fullPath,hashData)
        }
    }
}

async function addCmd(paths) {
    
    if(!paths || paths.length === 0) {
        console.log(chalk.yellow("Please specify files or folders to add."));
        return
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

    if(!fssync.existsSync(staging)) 
    fssync.mkdirSync(staging, {recursive: true})

    const hashPath = path.join(staging,"jvcs_hashcode.json")
    let hashData = {}

    if(fssync.existsSync(hashPath)) {
        hashData = JSON.parse(await fs.readFile(hashPath,"utf-8"))
    }

    let targets = []
    if(paths.length === 1 && paths[0] === ".") {
        targets = await fs.readdir(process.cwd(),{withFileTypes: true})
        targets = targets.filter((target)=> target.name !== ".jvcs" && target.name !== "node_modules").map((item)=> path.resolve(process.cwd(),item.name))
    }
    else {
        targets = paths.map((p)=> path.resolve(process.cwd(),p))
    }

    // copying the files and folders to staging area
    for(const target of targets) {

        try {

            if(!fssync.existsSync(target)) {
                console.log(chalk.red(`Path not found: ${target}`))
                continue
            }
    
            const destination = path.join(staging,path.relative(process.cwd(),target))
            await fs.mkdir(path.dirname(destination), {recursive: true})
    
            const stats = await fs.stat(target)
    
            if(stats.isFile()) {
                await fs.copyFile(target,destination)
                const hash = await getFileHash(target)
                hashData[path.relative(process.cwd(),target)] = {
                    hash,
                    time: new Date().toISOString(),
                }
                console.log(chalk.green(`Added file: ${path.relative(process.cwd(), target)}`));
            }
            else if(stats.isDirectory()) {
                await fs.cp(target,destination,{recursive: true})
                await hashDirectoryRecursive(target,hashData)
                console.log(chalk.cyan(`Added folder: ${path.relative(process.cwd(), target)}`));
            }
        }
        catch(error) {
            console.log(chalk.red(`Unexpected error: ${error.message}`));
        }
    }

    await fs.writeFile(hashPath, JSON.stringify(hashData, null, 2));
}

module.exports = addCmd