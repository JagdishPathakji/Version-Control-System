const validator = require("validator")
const User = require("../database/models/userModel")
const Repository = require("../database/models/repoModel")
const bcrypt = require("bcrypt")
const sendEmail = require("../externals/sendEmail")
const redisClient = require("../database/redisConnection")
const jwt = require("jsonwebtoken")

const getStreak = async (req,res)=> {

    try {
        const {username} = req.params

        const token = req.cookies.token
        if (!token) 
        return res.status(401).send({status:"login",message:"Unauthorized: Token not found, Please Login again"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await User.findOne({username})
        if(!user) return res.status(404).json({ status: false, message: "User not found" });

        const repos = await Repository.find({owner: user._id}).populate("content");
        console.log(repos)

        // plain array of commits with Content id
        const allCommits = repos.flatMap(repo=> repo.content)
        console.log(allCommits)

        const dailyCommits = {}
        for(const commit of allCommits) {
            const date = new Date(commit.createdAt).toISOString().split("T")[0]
            dailyCommits[date] = (dailyCommits[date] || 0 ) + 1
        }   

        console.log(dailyCommits)

        return res.status(200).send({status:true,dailyCommits})
    }
    catch(error) {
        return res.status(500).send({status:false,message:"Internal server error"})
    }
}

const follow = async (req,res)=> {

    try {
        const { username } = req.params

        const token = req.cookies.token
        if (!token) 
        return res.status(401).send({status:"login",message:"Unauthorized: Token not found, Please Login again"});

        if(!username)
        return res.status(404).send({status:false,message:"username not found for following"})

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const email = decoded.email

        const user = await User.findOne({ email });
        if (!user) return res.status(401).send({status:"login",message:"User not found"});

        const realUser = await User.findOne({username})
        if (!realUser)
        return res.status(404).send({ status: false, message: "Target user not found" });

        const followers = realUser.followingUser || []
        const following = user.followedUser || []

        if(followers.includes(user._id.toString())) {
            realUser.followingUser = followers.filter((id)=> id.toString() !== user._id.toString()) 
            user.followedUser = following.filter((id)=> id.toString() !== realUser._id.toString())
            await realUser.save()
            await user.save()
            return res.send({status:true,message:"Followed successfully",count:realUser.followingUser.length,followstatus:false})
        }

        realUser.followingUser.push(user._id)
        user.followedUser.push(realUser._id)
        await realUser.save()
        await user.save()

        return res.send({status:true,message:"Followed successfully",count:realUser.followingUser.length,followstatus:true})
    }
    catch(error) {
        return res.status(500).send({status:false,message:"Internal server error during following the user"})
    }
}

const getAllUsers = async (req,res)=> {

    try {
        const token = req.cookies.token
        if (!token) 
        return res.status(401).send({status:"login",message:"Unauthorized: Token not found, Please Login again"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decoded)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).send({status:"login",message:"User not found"});

        const allUsers = await User.find({ email: { $ne: email } }).select("-password");
        if(allUsers.length)
        res.status(200).json({data: allUsers,status:true})
        else
        res.status(200).json({data:[],status:true})
    }
    catch(error) {
        res.status(500).send({status:"login",message:"Internal server error occured in getting all users"})
    }
} 

const signup = async (req, res) => {
    try {
        const userData = req.body;
        const requiredFields = ["username", "email", "password"];

        console.log("Inside signup 1")
        
        // Check required fields
        if(!requiredFields.every((f) => userData[f])) {
            return res.status(400).send({ status: false, message: "Please fill all required fields" });
        }

        console.log("Inside signup 2")
        
        // Validate email & password
        if(!validator.isEmail(userData.email))
        return res.status(422).send({ status: false, message: "Email format is invalid" });
        const email = req.body.email;

        console.log("Inside signup 3")
        
        if(!validator.isStrongPassword(userData.password, {
            minLength: 8,
            maxLength: 20,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }))
        return res.status(422).send({ status: false, message: "Password is weak" });

        console.log("Inside signup 4")
        
        // Check email or username duplicate
        const existing = await User.findOne({
            $or: [{ email: userData.email }, { username: userData.username }],
        });

        console.log("Inside signup 5")
        
        if(existing) {

            console.log("Inside signup 6")
            
            return res.status(409).send({
                status: false,
                message: "This username or email already exists. Please select a different credentials or login if it is yours.",
            });
        }

        // Hash password
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);

        console.log("Inside signup 7")

        const count = await redisClient.get(`${email}`)
        if(count == null) {
            await redisClient.set(`${email}`, 1, {EX: 300})
        }
        else {
            const ttl = await redisClient.ttl(email); // seconds
            if(count > 2) {
                return res.send({
                    status:"redis",
                    message:`Too many OTP Request from this ${email}. Kindly try after ${ttl/60}`
                })
            }
            else {
                await redisClient.set(`${email}`,count+1, {EX: ttl})
            }
        }
        
        // Send OTP email
        const emailSent = await sendEmail(userData);
        if(!emailSent) {
            console.log("Inside signup 9")
            
            return res.status(422).send({
                status: false,
                message: `Failed to send OTP to ${userData.email}`,
            });
        }

        console.log("Inside signup 10")
        
        return res.status(200).send({
            status: true,
            message: "OTP sent to your email for verification",
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).send({
            status: false,
            message: "Internal Server Error during user creation",
        });
    }
}


const verifyEmail = async (req,res)=> {

    try {
        
        let userData = req.body
        
        const requiredFields = ["email","otp"]

        // check if all the required fields are present or not
        const allFieldsPresent = requiredFields.every((field)=> userData[field])
        if(!allFieldsPresent)
        return res.status(400).send({status:"field",message:"Please fill all the required fields"})


        if(!validator.isEmail(userData.email))
        return res.status(422).send({status:"format",message:"Email format is invalid"})

        let storedOtp
        try {
            storedOtp = await redisClient.get(`otp:${userData.email}`);
        }
        catch(error) {
            return res.status(500).send({
                status: "redis",
                message: "Error accessing OTP store. Please try again later",
            });
        }

        if (!storedOtp) return res.status(404).send({status:"otp",message:"OTP not found or expired"});
        if (storedOtp !== userData.otp) return res.status(400).send({status:"otp",message:"OTP is invalid"});


        const userDataRaw = await redisClient.get(`user:${userData.email}`);
        if (!userDataRaw) return res.status(404).send({status:"user",message:"User data not found. Please signup again"});
        
        const data = JSON.parse(userDataRaw)
        userData = {...userData,...data}
        await User.create(userData);
        
        await redisClient.del(`otp:${userData.email}`);
        await redisClient.del(`user:${userData.email}`);
        
        let token = null
        if(req.body.cli === true) {
            token =  jwt.sign({email: req.body.email}, process.env.JWT_SECRET_KEY)
            return res.status(201).send({status:true, message:"User created successfully",token:token})
        }

        return res.status(201).send({status:true, message:"User created successfully!"});
    }
    catch(error) {
        console.error("VerifyEmail error:", error);
        return res.status(500).send({status:false,message:"Internal Server Error during email verification"})
    }
}

const login = async (req,res)=> {
    
    try {

        console.log("Inside Login")
        const userData = req.body
        const requiredFields = ["email","password"]

        const allFieldsPresent = requiredFields.every((field)=> userData[field])
        if(!allFieldsPresent)
        return res.status(400).send({message:"Please fill all the required fields", status:false})

        // Email validation
        if(!validator.isEmail(userData.email))
        return res.status(422).send({message:"Email format is invalid",status:false})

        const databaseResult =  await User.findOne({
            $and : [{ email: userData.email }, { username: userData.username }],
        });
        if(!databaseResult)
        return res.status(404).send({message:"User not found",status:false})

        const isMatch = await bcrypt.compare(userData.password, databaseResult.password);
        if (!isMatch) return res.status(401).send({message:"Invalid credentials",status:false});


        let token
        if(req.body.cli === true) {
            token = jwt.sign({email:req.body.email}, process.env.JWT_SECRET_KEY)
            res.status(200).send({status:true,message:"User Login Successfull",token:token})
        }
        else {
            token = jwt.sign({email: req.body.email}, process.env.JWT_SECRET_KEY ,{expiresIn:"1d"})
            res.cookie("token",token, {
                httpOnly: true,
                secure: true,    
                sameSite: "none", 
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            })
    
            res.status(200).send({status:true,message:"User Login Successfull"})
        }
    }
    catch(error) {
        res.status(500).send({status:false,message:"Internal Server Error during Login"})
    }

}

const logout = async (req,res)=> {

    try {

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        return res.status(200).send({status:true,message:"Logout successfull"})
    }   
    catch(errror) {
        return res.status(500).send({status:false,message:"Internal server error in logout"})
    }
}

const verifyToken = async (req,res)=> {

    try {

        const token = req.cookies.token
        if (!token) 
        return res.status(401).send({status:false,message:"Unauthorized: Token not found, Please Login again"});

        let decoded
        try {
           decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } 
        catch (err) {
            return res.status(401).json({
                status: false,
                message: "Invalid or expired token. Please log in again.",
            });
        }

        let email = decoded.email
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send({message:"User not found",status:false});

        return res.status(200).send({message:"authenicated user",status:true})
    }   
    catch(error) {
        return res.status(500).send({message:"Internal server error during token verification", staus:false})
    }
}

const getUserProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .send({
          status: "login",
          message: "Unauthorized: Token not found, Please Login again",
        });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded);
    const decodedemail = decoded.email;

    const user = await User.findOne({ email: decodedemail });
    if (!user)
      return res
        .status(401)
        .send({ status: "email", message: "User not found" });

    const email = req.params.email;
    if (!email)
      return res
        .status(400)
        .send({
          status: "login",
          message: "Please provide email to fetch profile",
        });

    const userData = await User.findOne({ email: email }).select("-password");
    if (!userData)
      return res
        .status(401)
        .send({ status: "login", message: "No such user exists" });

    userData.status = true;
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).send({
      status: "login",
      message: "Internal Server error in getting user profile by email",
    });
  }
}


const getOwnProfile = async (req,res)=> {
   
    try {
        const token = req.cookies.token
        if (!token) 
        return res.status(401).send({status:"login",message:"Unauthorized: Token not found, Please Login again"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const email = decoded.email

        const user = await User.findOne({ email }).select("-password");
        if (!user) return res.status(404).send({status:"email",message:"User not found"});

        const repositories = await Repository.find({ owner: user._id }).select("_id name description visibility starred createdAt updatedAt")
        .sort({ createdAt: -1 });

        const profile = {
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            description: user.description || "",
            repositories: repositories.length,
            followedUser: user.followedUser ? user.followedUser.length : 0,
            followingUser: user.followingUser ? user.followingUser.length : 0,
        };

        return res.status(200).json({
            status: true,
            profile,
            repos: repositories,
        });

    }
    catch(error) {
        res.status(500).send({status:"login",message:"Internal Server error in getting user profile by email"})
    }

}

const getPublicProfile = async (req,res)=> {
   
    try {
        const { username } = req.params;

        const token = req.cookies.token
        if (!token) 
        return res.status(401).send({status:"login",message:"Unauthorized: Token not found, Please Login again"});

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const email = decoded.email

        const user = await User.findOne({ email })
        if (!user) return res.status(404).send({status:"email",message:"User not found"});

        const targetUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } }); // ignores case
        if (!targetUser)
        return res.status(404).send({ status: "username", message: "Requested user not found" });

        let followstatus = false
         if (targetUser.followingUser && targetUser.followingUser.map((id) => id.toString()).includes(user._id.toString())) 
        followstatus = true;
        
        const repositories = await Repository.find({ owner: targetUser._id, visibility: "public"}).select("_id name description visibility starred createdAt updatedAt")
        .sort({ createdAt: -1 });

        const profile = {
            _id: targetUser._id,
            username: targetUser.username,
            email: targetUser.email,
            createdAt: targetUser.createdAt,
            description: targetUser.description || "",
            repositories: repositories.length,
            followedUser: targetUser.followedUser ? targetUser.followedUser.length : 0,
            followingUser: targetUser.followingUser ? targetUser.followingUser.length : 0,
        };

        return res.status(200).json({
            status: true,
            profile,
            repos: repositories,
            followstatus
        });

    }
    catch(error) {
        res.status(500).send({status:"login",message:"Internal Server error in getting user profile by email"})
    }
}

const updateProfile = (req,res)=> {
    try {
        res.status(200).send("Update successful")
    }   
    catch(error) {
        res.status(500).send('Internal server error in profile updation')
    }
}

const deleteProfile = async (req,res)=> {
    try {

        const token = req.cookies.token
        if (!token) 
        return res.status(401).send("Unauthorized: Token not found, Please Login again");

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log(decoded)
        const email = decoded.email

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).send("User not found");

        console.log(user)
        await Repository.deleteMany({ owner: user._id });

        await User.findByIdAndDelete(user._id);

        res.clearCookie("token");

        return res.status(200).send("User and all linked repositories deleted successfully");
    }   
    catch(error) {
        res.status(500).send("Internal server error in deleting profile")
    }
}

module.exports = {
    getAllUsers,
    signup,
    login,
    getOwnProfile,
    updateProfile,
    deleteProfile,
    verifyEmail,
    verifyToken,
    logout,
    getUserProfile,
    getPublicProfile,
    follow,
    getStreak
}
