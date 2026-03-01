const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        // Images are uploaded via multer.
        images: Joi.any().optional(),
        price: Joi.number().min(0).required(),
        displayNights: Joi.number().integer().min(1).max(30).required(),
        maxGuests: Joi.number().integer().min(1).max(20).required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required()
    }).required(),
    // Optional image filenames selected for deletion on edit page.
    deleteImages: Joi.array().items(Joi.string()).single().optional(),
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().trim().min(5).max(500).required()
    }).required()
});

const reservationSchema = Joi.object({
    reservation: Joi.object({
        checkIn: Joi.date().required(),
        checkOut: Joi.date().greater(Joi.ref("checkIn")).required(),
        guests: Joi.number().integer().min(1).max(20).required(),
    }).required(),
});

module.exports = { listingSchema, reviewSchema, reservationSchema };
