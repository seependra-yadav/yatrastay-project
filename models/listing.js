const mongoose = require("mongoose");
const Review = require("./review.js");

const Schema = mongoose.Schema;

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60";
const DEFAULT_IMAGE_FILENAME = "default-listing-image";

const imageSchema = new Schema(
    {
        url: String,
        filename: String,
    },
    { _id: false }
);

// Listing document. `owner` controls edit/update/delete authorization.
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    // Cloudinary image metadata. New listings store both URL and filename.
    image: {
        type: imageSchema,
        default: () => ({
            url: DEFAULT_IMAGE,
            filename: DEFAULT_IMAGE_FILENAME,
        }),
        set: (value) => {
            if (!value) {
                return { url: DEFAULT_IMAGE, filename: DEFAULT_IMAGE_FILENAME };
            }

            if (typeof value === "string") {
                return { url: value, filename: DEFAULT_IMAGE_FILENAME };
            }

            return {
                url: value.url || DEFAULT_IMAGE,
                filename: value.filename || DEFAULT_IMAGE_FILENAME,
            };
        },
    },
    price: Number,
    location: String,
    country: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
});

// Unified image URL for both old (string) and new ({ url, filename }) records.
listingSchema.virtual("imageUrl").get(function () {
    if (!this.image) return DEFAULT_IMAGE;
    if (typeof this.image === "string") return this.image || DEFAULT_IMAGE;
    return this.image.url || DEFAULT_IMAGE;
});

// Data cleanup: when listing is deleted, remove linked reviews too.
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing && listing.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
