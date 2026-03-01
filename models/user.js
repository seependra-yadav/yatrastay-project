const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

// User profile + auth identity (email used as username for login).
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "host"],
            default: "user",
        },
    },
    { timestamps: true }
);

// Use email as the login identifier for local auth.
userSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
    usernameLowerCase: true,
});

module.exports = mongoose.model("User", userSchema);
