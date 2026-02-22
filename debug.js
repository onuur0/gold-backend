const mongoose = require("mongoose");
const connectDB = require("./config/db");
const City = require("./models/City");

async function debug() {
    await connectDB();
    const count = await City.countDocuments();
    console.log("Total cities:", count);

    const ankara = await City.findOne({ city: /Ankara/i });
    console.log("Ankara document:", JSON.stringify(ankara, null, 2));

    const allCities = await City.find({}, { city: 1 });
    console.log("First 5 cities:", allCities.slice(0, 5).map(c => c.city));

    mongoose.connection.close();
}

debug();
