const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js")

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/YatraStay');
}
main().then(() => {
    console.log("connected succes to db")
}).catch((err)=>console.log(err))


const initDb = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData);
    console.log("data was initialized");

};

initDb();
