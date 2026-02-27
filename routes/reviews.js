const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utilis/ExpressError.js");
const wrapAsync = require("../utilis/wrapAsync.js");
const { validateReview } = require("../middleware.js");

// create review
router.post("/", validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${listing._id}`);
}));

// delete single review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
