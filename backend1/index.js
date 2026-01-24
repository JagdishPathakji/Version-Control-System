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

// Default production origin
const PROD_ORIGIN = "https://version-control-system-frontend.onrender.com";

// When testing locally, set ALLOW_LOCAL=true in your .env to allow localhost origins
const allowedOrigins = [PROD_ORIGIN];
if (process.env.ALLOW_LOCAL === "true") {
    allowedOrigins.push(
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://jvcs-space.netlify.app/"
    );
}

console.log("CORS allowed origins:", allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
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
