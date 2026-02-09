const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");



async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/YatraStay');
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))




main().then(() => {
    console.log("connected succes to db")
}).catch((err) => console.log(err))
app.get("/", (req, res) => {
    res.send("server working")
})

//index Route
app.get("/listings", async (req, res) => {
      console.log("👉 /listings route HIT");

    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
    allListings.forEach(listing => {
        console.log(listing.image, typeof listing.image);
    });
});


//new Route
app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs")
})


//show Route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });

})


// create new route 
app.post("/listings", async (req, res) => {
    // let{title , description, image, price, country, location} = req.params;

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

//edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });

})

//Update route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);

})

//delete
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})
// app.get("/testListing", async(req, res) =>{

//     let sampleListing = new Listing({
//         title: "my new villa",
//         description:"by the beach",
//         price:2021,
//         location:"delhi",
//         country:"India"
//     })

//     await sampleListing.save();
//     console.log("sample was saved ");
//     res.send("succesful testing");
// })



app.listen(8080, () => {
    console.log("server Running")
})