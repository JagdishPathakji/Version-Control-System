const chalk = require("chalk")
const verifyOtp = require("./verifyOtp")
async function signup(signupData) {

    const response = await fetch("https://version-control-system-mebn.onrender.com/signup", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify(signupData)
    })

    const data = await response.json()

    if(data.status === true) {
        console.log(chalk.green(data.message))
        await verifyOtp(signupData)
    }
    else if(data.status == "user") {
        console.log(chalk.yellow(data.message))
    }
    else {
        throw new Error(data.message)
    }
}

module.exports = signup