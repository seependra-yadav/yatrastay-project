const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user.js");

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

// Render signup page
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// Local signup (email + password)
router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = new User({ email });
        const registeredUser = await User.register(user, password);
        await loginUser(req, registeredUser);

        req.flash("success", "Welcome! Your account was created.");
        res.redirect("/listings");
    } catch (err) {
        req.flash("error", err.message || "Signup failed");
        res.redirect("/signup");
    }
});

// Render login page
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// Local login
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect("/listings");
    }
);

// Logout user
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
