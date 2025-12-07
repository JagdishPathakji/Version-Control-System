const chalk = require("chalk")

async function handleDbForRepo(reponame,driveId,parentId,Content,token) {

    try {

        const response = await fetch("https://version-control-system-mebn.onrender.com/createCLIRepo", {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({reponame,driveId,parentId,content:Content,token})
        })

        const result = await response.json()
        if(!result.status) {
            console.log(chalk.red(`Server Error: ${result.message || "Unknown error"}`));
            return;
        }

        console.log(chalk.bold.green(`${result.message}`));

    }
    catch(error) {
        console.log(chalk.red("Failed to contact backend server."));
        console.log(chalk.red(error.message))
    }

}

module.exports = handleDbForRepo