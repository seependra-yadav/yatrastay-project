const Listing = require("../models/listing.js");
const ExpressError = require("../utilis/ExpressError.js");
const { geocodeListingLocation } = require("../utilis/geocoder.js");

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

    // Save Cloudinary URL + filename when upload exists.
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
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

    // Replace image only when a new file is uploaded.
    if (req.file) {
        updatedListingData.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    } else {
        updatedListingData.image = existingListing.image;
    }

    // Re-geocode only when location fields change.
    if (hasLocationChanged) {
        updatedListingData.geometry = await geocodeListingLocation(
            updatedListingData.location,
            updatedListingData.country
        );
    }

    await Listing.findByIdAndUpdate(id, updatedListingData);
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
