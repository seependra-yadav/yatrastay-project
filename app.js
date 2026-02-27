const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utilis/ExpressError.js");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");
const User = require("./models/user.js");

// Session config for login persistence + flash messages.
const sessionOptions = {
    secret: "yatrastay-secret",
    resave: false,
    saveUninitialized: false,
};

// DB bootstrapping + model index sync (removes stale indexes).
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/YatraStay');
    await User.syncIndexes();
}

// Core Express setup.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))
app.use(session(sessionOptions));
app.use(flash());

// Passport login/session setup (email-based local strategy).
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Shared template vars available in all EJS files.
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});




main().then(() => {
    console.log("connected succes to db")
}).catch((err) => console.log(err))
app.get("/", (req, res) => {
    res.send("server working")
})

// Feature routes.
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);


// 404 and global error handlers.
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next)=>{
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("server Running")
})
