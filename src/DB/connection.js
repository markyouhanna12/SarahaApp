import mongoose from "mongoose";
import {dbUrl} from "../../config/config.service.js"
const connectDB = async () => {
    try {
        mongoose.connection.on("connected",()=>{
            console.log("MongoDB connected successfully");
            
        })
        mongoose.connect(dbUrl,{
            serverSelectionTimeoutMS:5000
        })
    } catch (error) {
        console.log("Error connecting Database",error);
    }
}

export default connectDB