const express = require("express");
const passport = require("passport");
const router = express.Router();
const usersController = require("../controllers/users.js");
const { saveRedirectUrl } = require("../middleware.js");

// Signup routes.
router
    .route("/signup")
    .get(usersController.renderSignupForm)
    .post(usersController.signup);

// Login routes.
router.get("/login", usersController.renderLoginForm);

// POST login: passport auth + redirect to intended page.
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    usersController.login
);

// Logout route.
router.get("/logout", usersController.logout);

module.exports = router;
