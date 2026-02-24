const ExpressError = require("./utilis/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    next();
};

module.exports = { validateListing, validateReview };
