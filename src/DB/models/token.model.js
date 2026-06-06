import mongoose from "mongoose";


const tokenSchema = new mongoose.Schema({
    jti:{
        type:String,
        required:true,
        unique:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    expiresIn:{
        type:Date,
        required:true
    },


},
{
    timestamps:true
})

// ttl --> time to live
tokenSchema.index("expiresIn", {expireAfterSeconds : 0}) // delete doc

const TokenModel = mongoose.model("Token",tokenSchema)

export default TokenModel