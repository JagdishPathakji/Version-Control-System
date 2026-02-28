#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");
const dotenv = require("dotenv")
dotenv.config()

const beginCmd = require("./controllers/begin")
const initCmd = require("./controllers/init")
const addCmd = require("./controllers/add")
const commitCmd = require("./controllers/commit")
const unstageCmd = require("./controllers/unstage")
const logCmd = require("./controllers/log");
const pushCmd = require("./controllers/push");
const statusCmd = require("./controllers/status")
const revertCmd = require("./controllers/revert")
const cloneCmd = require("./controllers/clone")
const diff = require("./controllers/diff-engine/diff")
// file changed
 
yargs(hideBin(process.argv))
.scriptName("jvcs")
.command(
    "begin",
    chalk.blue("Initialize the Version Control System (login/signup).\n"),
    {},
    async () => {   
        try {
            await beginCmd()
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "init",
    chalk.blue("Create an empty repository.\n"),
    {},
    async () => {
        try {
            await initCmd()
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "add <paths...>",
    chalk.blue(
        `Add files or folders to the staging area.

        Command                          |   Description
        ---------------------------------|-------------------
        jvcs add .                       | all files/folders
        jvcs add <file1> <file2>         | multiple files
        jvcs add <folder1> <folder2>     | multiple folders
        jvcs add <file> <folder>         | files and folders\n`
    ),
    (yargs)=> {
        return yargs.positional("paths", {
            type: 'string',
            describe: 'Files and folders to stage'
        })
    },
    async (argv) => {
        try {
            await addCmd(argv.paths)
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "commit <message>",
    chalk.blue("Commit all the files/folders inside staging area\n"),
    (yargs)=> {
        return yargs.positional("message", {
            type: 'string',
            describe: 'Some message with your commit'
        })
    },
    async (argv)=> {
        try {
            await commitCmd(argv.message)
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "unstage <paths...>",
    chalk.blue(`
        Remove files and folders from staging area
        
        Command                          |   Description
        ---------------------------------|-------------------
        jvcs unstage .                   | all files/folders
        jvcs unstage <file1> <file2>     | multiple files
        jvcs unstage <folder1> <folder2> | multiple folders
        jvcs unstage <file> <folder>     | files and folders\n
    `),
    (yargs)=> {
        return yargs.positional("paths", {
            type: 'string',
            describe: 'Files and folders to unstage'
        })
    },
    async (argv)=> {
        try {
            await unstageCmd(argv.paths)
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "log",
    chalk.blue("show details of all commits"),
    {},
    async ()=> {
        try {
            await logCmd()
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "push",
    chalk.blue("Push all the commits to remote"),
    {},
    async ()=> {
        try {
            await pushCmd()
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "status",
    chalk.blue("Check status of each file/folder"),
    {},
    async ()=> {
        try {
            await statusCmd()
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "diff",
    chalk.blue(`
    Compare different states of your repository.
    
    Modes:
        stage-vs-cwd
        commit-vs-stage
        commit-vs-commit

    Example:
        jvcs diff --mode stage-vs-cwd
        jvcs diff --mode commit-vs-stage --commitId <id>
        jvcs diff --mode commit-vs-commit --commitA <id> --commitB <id>
    `),
    (yargs) => {
        return yargs
        .options("mode", {
            type: "string",
            describe: "Diff mode",
            choices: ["stage-vs-cwd", "commit-vs-stage", "commit-vs-commit"],
            demandOption: true
        })
        .option
    }
)
.command(
    "revert <commitId>",
    chalk.blue("Replace your working directory with specific commit you made previously"),
    (yargs)=> {
        return yargs.positional("commitId", {
            type: 'string',
            describe: 'commitId to move your head'
        })
    },
    async (argv)=> {
        try {
            await revertCmd(argv.commitId)
        }
        catch(error) {
            console.log(chalk.red(error))
        }
    }
)
.command(
    "clone <path>",
    chalk.blue("Clone a remote repository to local"),
    (yargs)=> {
        return yargs.positional("path", {
            type:"string",
            describe:"path must be of the form username/reponame"
        })
    },
    async (argv)=> {
        try {
            const [username, reponame] = argv.path.split("/");
            await cloneCmd(username,reponame)
        }   
        catch(error) {
            console.log(chalk.red(error || error.message))
        }
    }
)
.demandCommand(1, chalk.yellow("You need at least one command"))
.help()
.parse();