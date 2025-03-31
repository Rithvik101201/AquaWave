const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async()=>{
    const uri = process.env.MONGO_URI;
    try{
        await mongoose.connect(uri);
        console.log('Database connection established')
    }catch(err){
        console.log(err.message)
    }
}

module.exports = connectDB;