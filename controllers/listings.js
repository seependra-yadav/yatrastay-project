const Listing = require("../models/listing.js");
const ExpressError = require("../utilis/ExpressError.js");
const { geocodeListingLocation } = require("../utilis/geocoder.js");
const { cloudinary } = require("../utilis/cloudeConfig.js");

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?auto=format&fit=crop&w=800&q=60";
const DEFAULT_IMAGE_FILENAME = "default-listing-image";

const normalizeImage = (value) => {
    if (!value) {
        return { url: DEFAULT_IMAGE, filename: DEFAULT_IMAGE_FILENAME };
    }

    if (typeof value === "string") {
        return { url: value || DEFAULT_IMAGE, filename: DEFAULT_IMAGE_FILENAME };
    }

    return {
        url: value.url || DEFAULT_IMAGE,
        filename: value.filename || DEFAULT_IMAGE_FILENAME,
    };
};

const extractUploadedImages = (files = []) => {
    return files.map((file) => ({
        url: file.path,
        filename: file.filename,
    }));
};

const parseDeleteImages = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
};

const getCurrentImages = (listing) => {
    const hasGalleryImages = Array.isArray(listing.images) && listing.images.length > 0;
    const normalizedGallery = hasGalleryImages
        ? listing.images.map((img) => normalizeImage(img))
        : [];

    const hasOnlyDefaultGalleryImage =
        normalizedGallery.length === 1 &&
        normalizedGallery[0].filename === DEFAULT_IMAGE_FILENAME &&
        normalizedGallery[0].url === DEFAULT_IMAGE;

    // Use legacy image if gallery still has only default image.
    if (listing.image && (normalizedGallery.length === 0 || hasOnlyDefaultGalleryImage)) {
        return [normalizeImage(listing.image)];
    }

    return normalizedGallery.length > 0 ? normalizedGallery : [normalizeImage(null)];
};

// GET /listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({}).populate("owner", "name email");
    res.render("./listings/index.ejs", { allListings });
};

// GET /listings/new
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

// GET /listings/:id
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("owner", "name email")
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "name email",
            },
        });

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    // Backfill geometry for older listings that were created before map support.
    if (!listing.geometry) {
        const geometry = await geocodeListingLocation(listing.location, listing.country);
        if (geometry) {
            listing.geometry = geometry;
            await listing.save();
        }
    }

    res.render("./listings/show.ejs", { listing });
};

// POST /listings
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);

    // Save all uploaded files as listing images.
    if (req.files && req.files.length > 0) {
        newListing.images = extractUploadedImages(req.files);
    }

    // Resolve and store map coordinates from location text.
    newListing.geometry = await geocodeListingLocation(
        newListing.location,
        newListing.country
    );

    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "Listing created successfully");
    res.redirect(`/listings/${newListing._id}`);
};

// GET /listings/:id/edit
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });
};

// PUT /listings/:id
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const existingListing = await Listing.findById(id);

    if (!existingListing) {
        throw new ExpressError(404, "Listing not found");
    }

    const updatedListingData = { ...req.body.listing };
    const hasLocationChanged =
        existingListing.location !== updatedListingData.location ||
        existingListing.country !== updatedListingData.country;

    const deleteFilenames = new Set(parseDeleteImages(req.body.deleteImages));
    const currentImages = getCurrentImages(existingListing);
    const uploadedImages = extractUploadedImages(req.files);

    // Remove selected images, then append new uploads.
    const remainingImages = currentImages.filter(
        (img) => !deleteFilenames.has(img.filename)
    );
    const finalImages =
        remainingImages.concat(uploadedImages).length > 0
            ? remainingImages.concat(uploadedImages)
            : [normalizeImage(null)];

    // Keep old single-image field in sync for legacy records.
    updatedListingData.image = finalImages[0];
    updatedListingData.images = finalImages;

    // Re-geocode only when location fields change.
    if (hasLocationChanged) {
        updatedListingData.geometry = await geocodeListingLocation(
            updatedListingData.location,
            updatedListingData.country
        );
    }

    await Listing.findByIdAndUpdate(id, updatedListingData);

    // Delete removed assets from Cloudinary storage.
    const removedImages = currentImages.filter((img) => deleteFilenames.has(img.filename));
    const removableCloudinaryImages = removedImages.filter(
        (img) => img.filename && img.filename !== DEFAULT_IMAGE_FILENAME
    );
    await Promise.all(
        removableCloudinaryImages.map((img) =>
            cloudinary.uploader.destroy(img.filename).catch(() => null)
        )
    );

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
};

// DELETE /listings/:id
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
};
