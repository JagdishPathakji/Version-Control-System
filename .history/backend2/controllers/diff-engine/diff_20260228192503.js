const state = require("./state")
const engine = require("./diffEngine")
const chalk = require("chalk")
const { checkGlobalConfig, getGlobalConfig, checkforjvcs } = require("./utility")

function diff(mode, options = {}) {

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
        
    }
    catch(error) {

    }

}

module.exports = diff