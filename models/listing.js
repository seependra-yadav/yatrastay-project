const mongoose = require("mongoose");
const Review = require("./review.js");

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
            if (!v) return DEFAULT_IMAGE;
            if (typeof v === "object") return v.url || DEFAULT_IMAGE;
            if (v === "[object Object]") return DEFAULT_IMAGE;
            return v;
        },
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
});

// Remove all reviews linked to a listing when that listing is deleted.
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing && listing.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing = mongoose.model("Listing", listingSchema);
// modules.export = Listing;
module.exports = Listing;
