const inquirer = require("inquirer");
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")

async function verifyOtp(signupData) {

    const otp = await inquirer.prompt([
        {
            type: 'password',
            name: 'otp',
            validate: function(input) {
                if(input.length !== 6)
                return "OTP must be of 6 length"

                return true
            },
            filter: function(input) {
                return input.trim()
            },
            mask: '*',
        }
    ])

    console.log(`otp is : ${otp.otp}`)
    const response = await fetch("https://version-control-system-mebn.onrender.com/verifyEmail", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({email:signupData.email,otp:otp.otp,cli:true})
    });

    const data = await response.json();

    if (data.status === true) {
        console.log(chalk.green(data.message))
        
        const dirPath = path.join(require("os").homedir(), ".jvcs");
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

        const configPath = path.join(dirPath, "config.json");
        fs.writeFileSync(configPath,JSON.stringify({email: signupData.email,username: signupData.username,token: data.token, CLIENT_ID:"835069827989-3spob55ioa2ocudi3mo8u2ni2ecqohh7.apps.googleusercontent.com",CLIENT_SECRET:"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",REDIRECT_URI:"https://developers.google.com/oauthplayground",REFRESH_TOKEN:"1//04PuhJXX0wCQzCgYIARAAGAQSNwF-L9IrKGCADCAiBz77fG6nZ4qQ_0mgY36o1eyGCTxAl2Rcv2qhxXuXsud21xPvvS13v_YRTIo"},null,2));
    }
    else if(data.status === "user") {
        console.log(chalk.yellow(data.message))
    } 
    else {
        throw new Error(data.message)
    }

}

module.exports = verifyOtp