export default async function getAllRepo() {

    try {

        const response = await fetch(`https://version-control-system-mebn.onrender.com/getAllRepo`, {
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
       return {status:"login",message:"Error occured in fetching repo details"}
    }

}
