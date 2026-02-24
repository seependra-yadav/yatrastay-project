const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const ExpressError = require("../utilis/ExpressError.js");
const wrapAsync = require("../utilis/wrapAsync.js");
const { validateListing } = require("../middleware.js");

// index
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}));

// new
router.get("/new", (req, res) => {
    res.render("./listings/new.ejs");
});

// show
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("./listings/show.ejs", { listing });
}));

// create
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}?success=${encodeURIComponent("Listing created successfully")}`);
}));

// edit
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// update
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!req.body.listing.image) {
        req.body.listing.image = listing.image;
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}?success=${encodeURIComponent("Listing updated successfully")}`);
}));

// delete
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect(`/listings?success=${encodeURIComponent("Listing deleted successfully")}`);
}));

module.exports = router;
