const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utilis/wrapAsync.js");
const reviewsController = require("../controllers/reviews.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

// Create review.
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewsController.createReview)
);

// Delete review (author only).
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewsController.destroyReview)
);

module.exports = router;

