const { MongoClient } = require("mongodb");
const dns = require("dns");
require("dotenv").config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

async function verify() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        console.log("Bağlanılan Veritabanı:", db.databaseName);

        const collections = await db.listCollections().toArray();
        console.log("Mevcut Koleksiyonlar:", collections.map(c => c.name));

        const citySample = await db.collection("cities").findOne({ city: "Ankara" });
        console.log("\n--- Cities Koleksiyonu (Örnek: Ankara) ---");
        console.log(JSON.stringify(citySample, null, 2));

        const priceSample = await db.collection("prices").findOne({}, { sort: { createdAt: -1 } });
        console.log("\n--- Prices Koleksiyonu (En Son Kayıt) ---");
        console.log(JSON.stringify(priceSample, null, 2));

    } catch (err) {
        console.error("HATA:", err);
    } finally {
        await client.close();
    }
}

verify();
