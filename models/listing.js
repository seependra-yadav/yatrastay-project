const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: DEFAULT_IMAGE,
        set: (v) => {
            if (!v) return DEFAULT_IMAGE;                 // "", null, undefined
            if (typeof v === "object") return v.url || DEFAULT_IMAGE;
            return v;
        },
    },
    price: Number,
    location: String,
    country: String
});


const Listing = mongoose.model("Listing", listingSchema);
// modules.export = Listing;
module.exports = Listing;
