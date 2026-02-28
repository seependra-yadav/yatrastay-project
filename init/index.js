const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const DEFAULT_HOST_EMAIL = "demo1234@gmail.com";
const DEFAULT_HOST_NAME = "Demo Host";

const seedDatabase = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/YatraStay");
        console.log("Connected to DB");

        // Ensure default host exists for seeded listings.
        let hostUser = await User.findOne({ email: DEFAULT_HOST_EMAIL });
        if (!hostUser) {
            hostUser = await User.create({
                name: DEFAULT_HOST_NAME,
                email: DEFAULT_HOST_EMAIL,
            });
        }

        // Attach owner to each seed listing.
        const listingsWithOwner = initData.data.map((listing) => ({
            ...listing,
            owner: hostUser._id,
        }));

        await Listing.deleteMany({});
        await Listing.insertMany(listingsWithOwner);
        console.log("Seed data initialized");
    } catch (err) {
        console.error("Seed failed:", err);
    } finally {
        await mongoose.connection.close();
    }
};

seedDatabase();
