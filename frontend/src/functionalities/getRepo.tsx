export default async function getRepo() {

    try {

        const response = await fetch(`https://version-control-system-mebn.onrender.com/fetchRepoForCurrentUser`, {
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
        return {status:"login",message:"Error occured in fetching user repo"}
    }

}
