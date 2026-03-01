const User = require("../models/user.js");

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

// GET /signup
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// POST /signup
module.exports.signup = async (req, res) => {
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
};

// GET /login
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// POST /login (after passport authenticate)
module.exports.login = (req, res) => {
    const redirectUrl = res.locals.returnTo || "/listings";
    delete req.session.returnTo;

    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
};

// GET /logout
module.exports.logout = async (req, res) => {
    try {
        await logoutUser(req);
        req.flash("success", "You are logged out");
    } catch (err) {
        req.flash("error", err.message || "Logout failed");
    }

    res.redirect("/listings");
};

// GET /become-host
module.exports.renderBecomeHost = (req, res) => {
    if (req.user && req.user.role === "host") {
        req.flash("success", "Your host account is already active.");
        return res.redirect("/listings/new");
    }

    res.render("users/become-host.ejs");
};

// POST /become-host
module.exports.becomeHost = async (req, res) => {
    if (!req.user) {
        req.flash("error", "Please login first");
        return res.redirect("/login");
    }

    if (req.user.role === "host") {
        req.flash("success", "Your host account is already active.");
        return res.redirect("/listings/new");
    }

    await User.findByIdAndUpdate(req.user._id, { role: "host" });
    req.user.role = "host";

    req.flash("success", "Host profile activated. You can now list properties.");
    return res.redirect("/listings/new");
};
