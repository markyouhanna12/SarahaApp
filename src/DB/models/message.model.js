import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
    {
        content:{
            type:String,
            required:true,
            minlength:[2 , "message must be at least 2 characters"],
            maxlength:[500 , "message must be less than 500 characters"],
            trim:true
        },
        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:false
        },
        receiverId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        
    },{
        timestamps:true
    }
) 


const messageModel = mongoose.model("Message",messageSchema)

export default messageModel