const express = require("express");
const router = express.Router();

const reservationsController = require("../controllers/reservations.js");
const wrapAsync = require("../utilis/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

// Guest dashboard for own reservations.
router.get("/my", isLoggedIn, wrapAsync(reservationsController.listMyReservations));

// Cancel reservation.
router.delete(
    "/:reservationId",
    isLoggedIn,
    wrapAsync(reservationsController.cancelReservation)
);

module.exports = router;
