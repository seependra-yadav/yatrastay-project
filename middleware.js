const ExpressError = require("./utilis/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

// Request body validation for listing create/update.
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    next();
};

// Request body validation for review create.
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    next();
};

// Normalizes redirect URL to same-site path only.
const getPathFromUrl = (value) => {
    if (!value) return null;
    if (value.startsWith("/")) return value;

    try {
        const parsed = new URL(value);
        return `${parsed.pathname}${parsed.search}`;
    } catch {
        return null;
    }
};

// Stores the page/action user wanted before login.
const setReturnTo = (req) => {
    if (req.session.returnTo) return;

    if (req.method === "GET") {
        req.session.returnTo = req.originalUrl;
        return;
    }

    const referer = req.get("Referer");
    req.session.returnTo = getPathFromUrl(referer) || "/listings";
};

// Auth gate for protected routes.
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        setReturnTo(req);
        req.flash("error", "Please login first");
        return res.redirect("/login");
    }
    next();
};

// Keeps returnTo across passport session regeneration on login.
const saveRedirectUrl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// Authorization: only listing owner can edit/update/delete.
const isListingOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not allowed to do that");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

// Authorization: only review author can delete review.
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError(404, "Review not found");
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You are not allowed to do that");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports = {
    validateListing,
    validateReview,
    isLoggedIn,
    saveRedirectUrl,
    isListingOwner,
    isReviewAuthor,
};
