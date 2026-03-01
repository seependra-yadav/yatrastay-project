const Listing = require("../models/listing.js");
const Reservation = require("../models/reservation.js");
const ExpressError = require("../utilis/ExpressError.js");

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Normalizes date-only values to local midnight.
const parseDateOnly = (value) => {
    const parsed = new Date(value);
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const calculateNights = (checkIn, checkOut) => {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / MILLISECONDS_PER_DAY);
};

// POST /listings/:id/reservations
module.exports.createReservation = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner", "name email");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    if (listing.owner && listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You cannot reserve your own property.");
        return res.redirect(`/listings/${id}`);
    }

    if (typeof listing.price !== "number" || listing.price < 0) {
        req.flash("error", "Reservation is unavailable for this listing.");
        return res.redirect(`/listings/${id}`);
    }

    const checkIn = parseDateOnly(req.body.reservation.checkIn);
    const checkOut = parseDateOnly(req.body.reservation.checkOut);
    const guests = Number(req.body.reservation.guests);
    const nights = calculateNights(checkIn, checkOut);
    const listingMaxGuests =
        Number.isInteger(listing.maxGuests) && listing.maxGuests > 0
            ? listing.maxGuests
            : 4;

    if (nights < 1) {
        req.flash("error", "Check-out must be after check-in.");
        return res.redirect(`/listings/${id}`);
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > listingMaxGuests) {
        req.flash("error", `Guests must be between 1 and ${listingMaxGuests}.`);
        return res.redirect(`/listings/${id}`);
    }

    // Blocks overlapping active bookings for this listing.
    const overlapping = await Reservation.findOne({
        listing: listing._id,
        status: "confirmed",
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
    });

    if (overlapping) {
        req.flash("error", "Selected dates are not available.");
        return res.redirect(`/listings/${id}`);
    }

    const totalPrice = nights * listing.price;

    await Reservation.create({
        listing: listing._id,
        guest: req.user._id,
        checkIn,
        checkOut,
        guests,
        nights,
        totalPrice,
        status: "confirmed",
    });

    req.flash("success", "Property reserved successfully.");
    return res.redirect("/reservations/my");
};

// GET /reservations/my
module.exports.listMyReservations = async (req, res) => {
    const reservations = await Reservation.find({ guest: req.user._id })
        .populate("listing", "title location country imageUrl")
        .sort({ createdAt: -1 });

    res.render("reservations/index.ejs", { reservations });
};

// DELETE /reservations/:reservationId
module.exports.cancelReservation = async (req, res) => {
    const { reservationId } = req.params;
    const reservation = await Reservation.findById(reservationId).populate({
        path: "listing",
        select: "owner",
    });

    if (!reservation) {
        throw new ExpressError(404, "Reservation not found");
    }

    const isGuestOwner = reservation.guest.equals(req.user._id);
    const isListingOwner =
        reservation.listing &&
        reservation.listing.owner &&
        reservation.listing.owner.equals(req.user._id);

    if (!isGuestOwner && !isListingOwner) {
        throw new ExpressError(403, "You are not allowed to cancel this reservation");
    }

    if (reservation.status === "cancelled") {
        req.flash("success", "Reservation already cancelled.");
        return res.redirect("/reservations/my");
    }

    reservation.status = "cancelled";
    await reservation.save();

    req.flash("success", "Reservation cancelled successfully.");
    return res.redirect("/reservations/my");
};
