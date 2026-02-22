const { MongoClient } = require("mongodb");
const dns = require("dns");
require("dotenv").config();

// Fix DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

async function debug() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        console.log("Connected to DB:", db.databaseName);

        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        for (let coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`Collection: ${coll.name}, Count: ${count}`);
        }

    } catch (err) {
        console.error("DEBUG ERROR:", err);
    } finally {
        await client.close();
    }
}

debug();
