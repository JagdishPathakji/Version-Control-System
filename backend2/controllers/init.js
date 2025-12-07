const fs = require("fs").promises;
const path = require("path");
const chalk = require("chalk");
const fssync = require("fs")
const { getGlobalConfig, checkGlobalConfig } = require("./utility")

async function initCmd() {

    if(!checkGlobalConfig()) {
        console.log(chalk.red("No existing session found. Please login or signup."))
        console.log(chalk.green("jvcs --help for help"))
        return
    }
    
    let configData = null
    configData = getGlobalConfig()
    
    if(!configData) {
        console.log(chalk.red("No existing session found. Please login or signup."))
        console.log(chalk.green("jvcs --help for help"))
        return
    }

    // initialize an empty folder with the name of current directory
    const cwd = process.cwd()
    const home = require("os").homedir()

    if(cwd ===  home) {
        console.log(chalk.red("Cannot initialize a repository in your home directory."));
        console.log(chalk.yellow("Hint: navigate to a project folder and run 'jvcs init' there."));
        process.exit(1);
    }

    const repoPath = path.join(cwd,".jvcs")
    if(fssync.existsSync(repoPath)) {
        console.log(chalk.yellow("Repository already is initialized."));
        process.exit(1);    
    }

    fssync.mkdirSync(repoPath)
    fssync.mkdirSync(path.join(repoPath,"commits"))
    fssync.mkdirSync(path.join(repoPath,"staging"))
    
    const config = {
        repoName: path.basename(cwd),
        createdAt: new Date().toISOString(),
        remote: null,
        owner : {
            username: configData.username,
            email: configData.email
        }
    }

    fssync.writeFileSync(path.join(repoPath, "config.json"), JSON.stringify(config, null, 2))
    fssync.writeFileSync(path.join(repoPath, "HEAD"), "");

    console.log(chalk.green(`Initialized empty JVCS repository`));
}

module.exports = initCmd