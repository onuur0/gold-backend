const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["harem", "dolar", "euro", "ons"]
    },
    alis: {
        type: Number,
        required: true
    },
    satis: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Price", priceSchema, "prices");
