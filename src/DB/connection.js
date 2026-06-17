import mongoose from "mongoose";
import {dbUrl} from "../../config/config.service.js"
import chalk from "chalk"

const connectDB = async () => {
    try {
        mongoose.connection.on("connected",()=>{
            console.log(chalk.bold.green("MongoDB connected successfully"));
            
        })
        mongoose.connect(dbUrl,{
            serverSelectionTimeoutMS:5000
        })
    } catch (error) {
        console.log(chalk.red("Error connecting Database"),error);
    }
}

export default connectDB