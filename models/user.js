const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
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
