const express = require("express");
const multer = require("multer");
const router = express.Router();

const wrapAsync = require("../utilis/wrapAsync.js");
const { storage } = require("../utilis/cloudeConfig.js");
const listingsController = require("../controllers/listings.js");
const { validateListing, isLoggedIn, isListingOwner } = require("../middleware.js");

const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
const MAX_IMAGES_PER_LISTING = 10;
const MAX_IMAGE_SIZE_MB = 10;

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, // Per-image limit.
        files: MAX_IMAGES_PER_LISTING,
    },
    fileFilter: (req, file, cb) => {
        // Accept only png, jpg, jpeg files.
        if (allowedMimeTypes.includes(file.mimetype)) return cb(null, true);
        cb(new Error("Only PNG, JPG, and JPEG images are allowed"));
    },
});

// Listing collection routes.
router
    .route("/")
    .get(wrapAsync(listingsController.index))
    .post(
        isLoggedIn,
        upload.array("listing[images]", MAX_IMAGES_PER_LISTING),
        validateListing,
        wrapAsync(listingsController.createListing)
    );

// New listing form.
router.get("/new", isLoggedIn, listingsController.renderNewForm);

// Listing item routes.
router
    .route("/:id")
    .get(wrapAsync(listingsController.showListing))
    .put(
        isLoggedIn,
        isListingOwner,
        upload.array("listing[images]", MAX_IMAGES_PER_LISTING),
        validateListing,
        wrapAsync(listingsController.updateListing)
    )
    .delete(isLoggedIn, isListingOwner, wrapAsync(listingsController.destroyListing));

// Edit listing form.
router.get(
    "/:id/edit",
    isLoggedIn,
    isListingOwner,
    wrapAsync(listingsController.renderEditForm)
);

module.exports = router;

