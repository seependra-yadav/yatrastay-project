const express = require("express");
const router = express.Router({ mergeParams: true });

const reservationsController = require("../controllers/reservations.js");
const wrapAsync = require("../utilis/wrapAsync.js");
const { isLoggedIn, validateReservation } = require("../middleware.js");

// Create reservation for a listing.
router.post(
    "/",
    isLoggedIn,
    validateReservation,
    wrapAsync(reservationsController.createReservation)
);

module.exports = router;
