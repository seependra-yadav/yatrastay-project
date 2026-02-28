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

const getDefaultImage = () => ({
    url: DEFAULT_IMAGE,
    filename: DEFAULT_IMAGE_FILENAME,
});

const normalizeImage = (value) => {
    if (!value) return getDefaultImage();

    if (typeof value === "string") {
        return { url: value || DEFAULT_IMAGE, filename: DEFAULT_IMAGE_FILENAME };
    }

    return {
        url: value.url || DEFAULT_IMAGE,
        filename: value.filename || DEFAULT_IMAGE_FILENAME,
    };
};

const normalizeImages = (value) => {
    if (!value) return [getDefaultImage()];

    const items = Array.isArray(value) ? value : [value];
    const normalized = items.map((item) => normalizeImage(item));

    return normalized.length > 0 ? normalized : [getDefaultImage()];
};

const resolveListingImages = (listing) => {
    const galleryImages = Array.isArray(listing.images)
        ? normalizeImages(listing.images)
        : [];
    const hasOnlyDefaultGalleryImage =
        galleryImages.length === 1 &&
        galleryImages[0].filename === DEFAULT_IMAGE_FILENAME &&
        galleryImages[0].url === DEFAULT_IMAGE;

    // For legacy records, prefer old `image` if gallery is still default.
    if (listing.image && (galleryImages.length === 0 || hasOnlyDefaultGalleryImage)) {
        return [normalizeImage(listing.image)];
    }

    return galleryImages.length > 0 ? galleryImages : [getDefaultImage()];
};

const geometrySchema = new Schema(
    {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
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
        default: () => getDefaultImage(),
        set: normalizeImage,
    },
    // Primary gallery field for listing photos.
    images: {
        type: [imageSchema],
        default: () => [getDefaultImage()],
        set: normalizeImages,
    },
    price: Number,
    location: String,
    country: String,
    geometry: {
        type: geometrySchema,
        default: null,
    },
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

// Enables geospatial queries when needed.
listingSchema.index({ geometry: "2dsphere" });

// Unified image URL for both old (string) and new ({ url, filename }) records.
listingSchema.virtual("imageUrl").get(function () {
    const urls = this.imageUrls;
    return Array.isArray(urls) && urls.length > 0 ? urls[0] : DEFAULT_IMAGE;
});

// Unified image URL list for gallery UI.
listingSchema.virtual("imageUrls").get(function () {
    return resolveListingImages(this).map((img) => img.url || DEFAULT_IMAGE);
});

// Unified image object list (url + filename) for edit form actions.
listingSchema.virtual("imageGallery").get(function () {
    return resolveListingImages(this);
});

// Data cleanup: when listing is deleted, remove linked reviews too.
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing && listing.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
