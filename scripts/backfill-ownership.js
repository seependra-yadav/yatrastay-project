const mongoose = require("mongoose");

const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/YatraStay";
const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error("Usage: npm run backfill:ownership -- <user-email>");
    process.exit(1);
}

async function backfillOwnership() {
    await mongoose.connect(MONGO_URI);

    const user = await User.findOne({ email: targetEmail.toLowerCase().trim() });
    if (!user) {
        throw new Error(`User not found for email: ${targetEmail}`);
    }

    const listingResult = await Listing.updateMany(
        { owner: { $exists: false } },
        { $set: { owner: user._id } }
    );

    const reviewResult = await Review.updateMany(
        { author: { $exists: false } },
        { $set: { author: user._id } }
    );

    console.log(`Ownership backfill complete for: ${user.email}`);
    console.log(`Listings updated: ${listingResult.modifiedCount}`);
    console.log(`Reviews updated: ${reviewResult.modifiedCount}`);
}

backfillOwnership()
    .catch((err) => {
        console.error("Backfill failed:", err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
