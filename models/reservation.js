const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Reservation created by a guest for a listing.
const reservationSchema = new Schema(
    {
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },
        guest: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        checkIn: {
            type: Date,
            required: true,
        },
        checkOut: {
            type: Date,
            required: true,
        },
        guests: {
            type: Number,
            required: true,
            min: 1,
            max: 20,
        },
        nights: {
            type: Number,
            required: true,
            min: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["confirmed", "cancelled"],
            default: "confirmed",
        },
    },
    { timestamps: true }
);

// Speeds up overlap lookups and guest dashboards.
reservationSchema.index({ listing: 1, checkIn: 1, checkOut: 1, status: 1 });
reservationSchema.index({ guest: 1, createdAt: -1 });

module.exports = mongoose.model("Reservation", reservationSchema);
