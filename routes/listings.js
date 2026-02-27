const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const ExpressError = require("../utilis/ExpressError.js");
const wrapAsync = require("../utilis/wrapAsync.js");
const { validateListing, isLoggedIn, isListingOwner } = require("../middleware.js");

// GET /listings - list all listings (with owner info).
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).populate("owner", "name email");
    res.render("./listings/index.ejs", { allListings });
}));

// GET /listings/new - render create form (login required).
router.get("/new", isLoggedIn, (req, res) => {
    res.render("./listings/new.ejs");
});

// GET /listings/:id - listing detail with owner + reviews + review authors.
router.get("/:id", wrapAsync(async (req, res) => {
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

    res.render("./listings/show.ejs", { listing });
}));

// POST /listings - create listing and bind owner to logged-in user.
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing created successfully");
    res.redirect(`/listings/${newListing._id}`);
}));

// GET /listings/:id/edit - owner-only edit page.
router.get("/:id/edit", isLoggedIn, isListingOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// PUT /listings/:id - owner-only listing update.
router.put("/:id", isLoggedIn, isListingOwner, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!req.body.listing.image) {
        req.body.listing.image = listing.image;
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
}));

// DELETE /listings/:id - owner-only delete.
router.delete("/:id", isLoggedIn, isListingOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully");
    res.redirect(`/listings`);
}));

module.exports = router;

