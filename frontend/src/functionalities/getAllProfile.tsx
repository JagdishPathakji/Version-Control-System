export default async function getAllProfile() {

    try {

        const response = await fetch(`https://version-control-system-mebn.onrender.com/getAllUsers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        })

        const output = await response.json()
        console.log(output)
        return output
    }
    catch(error) {
       return {status:"login",message:"Error occured in fetching user details"}
    }

}
