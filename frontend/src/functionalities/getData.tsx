export default async function getData(email:String) {

    try {

        const response = await fetch(`https://version-control-system-mebn.onrender.com/getUserProfile/${email}`, {
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
