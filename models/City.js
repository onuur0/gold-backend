const mongoose = require("mongoose");

const productRatioSchema = new mongoose.Schema({
    alis: { type: Number, required: true },
    satis: { type: Number, required: true }
}, { _id: false });

const citySchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        unique: true
    },
    products: {
        has: productRatioSchema,
        gram24: productRatioSchema,
        gram22: productRatioSchema,
        ceyrek: productRatioSchema,
        yarim: productRatioSchema,
        tam: productRatioSchema
    }
});

module.exports = mongoose.model("City", citySchema, "cities");
