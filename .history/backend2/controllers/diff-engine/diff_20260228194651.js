const AppState  = require("./state")
const getDiff = require("./diffEngine")
const chalk = require("chalk")
const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("../utility")

async function diff(mode, options = {}) {

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

    try {

        const files = getDiff(mode, options)
        if(!files || files.length === 0) {
            console.log(chalk.yellow("No differences found."))
            return
        }

        const appState = new AppState (mode, files)
        startUI(appState)
    }
    catch(error) {
        console.log(chalk.red("Diff Error: " + (error.message || error)))
    }

}

module.exports = diff