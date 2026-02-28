const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Load .env values before importing modules that use env keys.
require("dotenv").config({ path: path.join(__dirname, ".env") });

const ExpressError = require("./utilis/ExpressError.js");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");
const User = require("./models/user.js");

const app = express();

// Fail fast if Cloudinary credentials are missing.
const requiredCloudinaryEnv = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

const missingCloudinaryEnv = requiredCloudinaryEnv.filter((key) => !process.env[key]);
if (missingCloudinaryEnv.length > 0) {
    throw new Error(
        `Missing required Cloudinary env vars: ${missingCloudinaryEnv.join(", ")}`
    );
}

// Session settings for login + flash messages.
const sessionOptions = {
    secret: "yatrastay-secret",
    resave: false,
    saveUninitialized: false,
};

// Connect DB and sync user indexes.
const connectDatabase = async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/YatraStay");
    await User.syncIndexes();
};

// Core app setup.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());

// Passport auth setup (login with email).
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Shared locals for all templates.
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Health route.
app.get("/", (req, res) => {
    res.send("server working");
});

// Feature routes.
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);

// Not found handler.
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Global error handler.
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";

    // Log full details only for 5xx errors.
    if (statusCode >= 500) {
        console.error(err);
    }

    // Convert multer validation errors to clean request errors.
    if (err.name === "MulterError") {
        statusCode = 400;
    }

    // Show a clear message for Cloudinary auth/config issues.
    if (
        typeof message === "string" &&
        (message.includes("Invalid API Key") ||
            message.includes("api_key") ||
            message.includes("cloud_name"))
    ) {
        statusCode = 500;
        message = "Image upload failed. Please check Cloudinary credentials.";
    }

    res.status(statusCode).send(message);
});

connectDatabase()
    .then(() => {
        console.log("Connected to database");
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

app.listen(8080, () => {
    console.log("Server running on port 8080");
});
