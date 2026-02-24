const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 500
    },
    rating:{
        type:Number,
        required: true,
        min:1,
        max:5
    },
    createAt:{
        type: Date,
        default:Date.now()
    }
});

module.exports = mongoose.model("Review" , reviewSchema);

