#!/usr/bin/env node
const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")
const cookieparser = require("cookie-parser")
const main = require("./database/dbConnection")
const mainRouter = require("./routes/main.router")
const redisClient = require("./database/redisConnection")


const app = express()
const port = process.env.PORT || 4000

app.use(cookieparser())
app.use(express.json())

// Allowed origins (without trailing slashes)
const allowedOrigins = [
    "https://version-control-system-frontend.onrender.com",
    "https://girgit-space.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
];

console.log("CORS allowed origins:", allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl)
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, "");
        if (allowedOrigins.includes(cleanOrigin)) {
            return callback(null, true);
        } else {
            console.warn("Blocked by CORS:", origin);
            return callback(null, false);
        }
    },
    credentials: true,            // allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/", mainRouter)

async function prepare() {

    await main();
    console.log("MongoDB connection successful");
    
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected successfully");
    }
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

prepare()
