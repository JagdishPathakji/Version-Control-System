const mongoose = require("mongoose")

async function main() {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    try {
        const collections = await mongoose.connection.db.listCollections({ name: "repositories" }).toArray();
        if (collections.length > 0) {
            const indexes = await mongoose.connection.db.collection("repositories").indexes();
            const hasLegacyNameIndex = indexes.some(idx => idx.name === "name_1");
            if (hasLegacyNameIndex) {
                await mongoose.connection.db.collection("repositories").dropIndex("name_1");
                console.log("Successfully dropped legacy unique index 'name_1' from repositories");
            }
        }
    } catch (err) {
        console.log("Database index note:", err.message);
    }
}

module.exports = main