const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        // Image is uploaded via multer; keep this optional for form payloads.
        image: Joi.any().optional(),
        price: Joi.number().min(0).required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required()
    }).required()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().trim().min(5).max(500).required()
    }).required()
});

module.exports = { listingSchema, reviewSchema };
