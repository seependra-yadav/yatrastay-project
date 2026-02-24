const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utilis/ExpressError.js");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");



async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/YatraStay');
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))
app.use((req, res, next) => {
    res.locals.success = req.query.success || null;
    next();
});




main().then(() => {
    console.log("connected succes to db")
}).catch((err) => console.log(err))
app.get("/", (req, res) => {
    res.send("server working")
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);



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
