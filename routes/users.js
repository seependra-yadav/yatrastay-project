const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware.js");

// Promise wrappers for passport callback APIs.
const loginUser = (req, user) =>
    new Promise((resolve, reject) => {
        req.login(user, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

const logoutUser = (req) =>
    new Promise((resolve, reject) => {
        req.logout((err) => {
            if (err) return reject(err);
            resolve();
        });
    });

// GET signup page.
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// POST signup: create user + auto-login + redirect back if returnTo exists.
router.post("/signup", async (req, res) => {
    try {
        const redirectUrl = req.session.returnTo || "/listings";
        const { name, email, password } = req.body;
        const user = new User({ name, email });
        const registeredUser = await User.register(user, password);
        await loginUser(req, registeredUser);
        delete req.session.returnTo;

        req.flash("success", "Welcome! Your account was created.");
        res.redirect(redirectUrl);
    } catch (err) {
        req.flash("error", err.message || "Signup failed");
        res.redirect("/signup");
    }
});

// GET login page.
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// POST login: passport auth + redirect to intended page.
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        const redirectUrl = res.locals.returnTo || "/listings";
        delete req.session.returnTo;
        req.flash("success", "Welcome back!");
        res.redirect(redirectUrl);
    }
);

// GET logout: destroy login session.
router.get("/logout", async (req, res) => {
    try {
        await logoutUser(req);
        req.flash("success", "You are logged out");
    } catch (err) {
        req.flash("error", err.message || "Logout failed");
    }
    res.redirect("/listings");
});

module.exports = router;
