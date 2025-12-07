const path = require("path")
const chalk = require("chalk")
const fs = require("fs")
async function login(loginData) {

    const response = await fetch("https://version-control-system-mebn.onrender.com/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({email:loginData.email,username:loginData.username,password:loginData.password,cli:true})
    })
    
    const data = await response.json()
    
    if(data.status === true) {
        console.log(chalk.green(data.message))

        const dirPath = path.join(require("os").homedir(), ".jvcs");
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        const configPath = path.join(dirPath, "config.json");
        fs.writeFileSync(configPath,JSON.stringify({email: loginData.email,username: loginData.username,token: data.token, CLIENT_ID:"835069827989-3spob55ioa2ocudi3mo8u2ni2ecqohh7.apps.googleusercontent.com",CLIENT_SECRET:"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",REDIRECT_URI:"https://developers.google.com/oauthplayground",REFRESH_TOKEN:"1//04Bw4ppIL47BwCgYIARAAGAQSNwF-L9IrNrnUfGVHVTctA3YoNHB3_nuq0KhcCoE7kkfVg1ZGq5bYUWoDJn4o-hzfC0vRQwZ8PmY"},null,2));        
    }
    else {
        throw new Error(data.message)
    }
}

module.exports = login