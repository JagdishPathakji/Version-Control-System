const fs = require("fs")
const path = require("path")

const config = path.join(require("os").homedir(),".jvcs","config.json")

function checkGlobalConfig() {
    return fs.existsSync(config)
}

function getGlobalConfig() {
    if(checkGlobalConfig()) {
        const configData = JSON.parse(fs.readFileSync(config,"utf-8"))
        if(configData.username && configData.email && configData.token)
        return configData
    }

    return null
}

function checkforjvcs() {
    const jvcsPath = path.join(process.cwd(),".jvcs")
    return fs.existsSync(jvcsPath)
}

module.exports = {
    checkGlobalConfig,
    getGlobalConfig,
    checkforjvcs
}