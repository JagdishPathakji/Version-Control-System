const inquirer = require("inquirer");
const chalk = require("chalk");
const validator = require("validator");
const signup = require("./signup")
const login = require("./login")
const path = require("path")
const fs = require("fs")



async function beginCmd() {

    const config = path.join(require("os").homedir(),".jvcs","config.json")
    let isInitialized = false
    let configData = null
    if(fs.existsSync(config)) {
        isInitialized = true
        configData = JSON.parse(fs.readFileSync(config,"utf-8"))
    }
    
    if (isInitialized) {
        console.log(chalk.green(`You are already logged in as ${configData.username} (${configData.email})`))
        console.log(chalk.yellow(`[1] Continue \n[2] Logout \nChoose an option (1/2) : `))

        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'choice',
                validate: function (input) {
                    if (input === "1" || input === "2")
                        return true

                    return "Please enter 1 or 2"
                },
                filter: function (input) {
                    return input.trim()
                }
            }
        ])

        console.log(`Your choice was ${answer.choice}`)
        if (answer.choice === "1") {
            console.log(chalk.green("Continuing as current user..."))
            console.log(chalk.green("jvcs --help for help"))
        }
        else {
            console.log(chalk.green("logging out..."))
            fs.unlinkSync(config)
            console.log(chalk.green("Logged out Successfully"))
            console.log(chalk.green("Please login or signup again (jvcs begin) to use version control system"))
            console.log(chalk.green("jvcs --help for help"))
        }

        return
    }

    console.log(chalk.red("No existing session found. Please login or signup."))
    console.log(chalk.yellow(`[1] Signup \n[2] login \nChoose an option (1/2) : `))

    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'choice',
            validate: function (input) {

                if (input === "1" || input === "2")
                    return true

                return "Please enter 1 or 2"
            },
            filter: function (input) {
                return input.trim(); // optional: remove whitespace
            }
        }
    ])

    if (answer.choice === "1") {

        const signupData = await inquirer.prompt([
            {
                type: 'input',
                name: 'username',
                filter: function (input) {
                    return input.trim()
                }
            },
            {
                type: 'input',
                name: 'email',
                validate: function (input) {
                    // validate email
                    if (validator.isEmail(input))
                        return true

                    return "Please enter an valid email"
                },
                filter: function (input) {
                    return input.trim()
                }
            },
            {
                type: 'password',
                name: 'password',
                validate: function (input) {
                    // validate password
                    if (validator.isStrongPassword(input, {
                        minLength: 8,
                        maxLength: 20,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1,
                        minSymbols: 1,
                    }))
                        return true

                    return "Please enter a strong password"
                },
                filter: function (input) {
                    return input.trim()
                }
            },
            {
                type: 'password',
                name: 'confirmPassword',
                validate: function (input, answers) {
                    if (answers.password !== input)
                        return "password must be same as above"

                    return true
                },
                filter: function (input) {
                    return input.trim()
                }
            }
        ])

        try {
            await signup(signupData)
        }
        catch (error) {
            console.log(chalk.red(error))
        }
    }
    else {

        const loginData = await inquirer.prompt([
            {
                type: 'input',
                name: 'username',
                filter: function (input) {
                    return input.trim()
                },
                validate: function (input) {
                    if (input === "")
                        return "email cannot be empty"

                    return true
                }
            },
            {
                type: 'input',
                name: 'email',
                filter: function (input) {
                    return input.trim()
                },
                validate: function (input) {
                    if (!validator.isEmail(input))
                        return "email is not valid"

                    if (input === "")
                        return "email cannot be empty"

                    return true
                }
            },
            {
                type: 'password',
                name: 'password',
                filter: function (input) {
                    return input.trim()
                },
                validate: function (input) {

                    if (input === "")
                        return "password cannot be empty"

                    return true
                }
            }
        ])

        try {
            await login(loginData)
        }
        catch (error) {
            console.log(chalk.red(error))
        }
    }
}

module.exports = beginCmd