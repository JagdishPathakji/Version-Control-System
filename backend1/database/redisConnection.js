const redis = require("redis");

const redisClient = redis.createClient({
    url: "redis://default:u2aduoQ5OiX2Y3PZ22p7IUCcxX0O82cH@redis-13091.crce206.ap-south-1-1.ec2.redns.redis-cloud.com:13091",
});

redisClient.on("connect", () => {
    console.log("Redis client connected");
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

module.exports = redisClient;
