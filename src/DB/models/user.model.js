import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../utils/enums/user.enum.js";

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,"FirstName is mandatory"],
        minLength:2,
        maxLength:25
    },
    lastName:{
        type:String,
        required:[true,"lastName is mandatory"],
        minLength:2,
        maxLength:25
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:function () {
            return this.provider == ProviderEnum.System
        }
    },
    DOB:{
        type:Date
    },
    phone:{
        type:String,
        unique:true
    },
    role:{
        type:Number,
        enum:Object.values(RoleEnum),
        default:RoleEnum.User

    },
    provider:{
        type:Number,
        enum:Object.values(ProviderEnum),
        default:ProviderEnum.System
    },
    gender:{
        type:Number,
        enum:Object.values(GenderEnum),
        default:GenderEnum.Male
        
    },
    confirmEmail:{
        type:Date
    },
    profilePic:{
        type:String
    },
    coverImages:{
        type:[String]
    },
    age:{
        type:Number,
        minLength:18,
        maxLength:50
    },
    changeCredentialsTime:{
        type:Date
    }


},
{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

userSchema.virtual("username").set(function(value){
    const {firstName,lastName} = value?.split(" ") || []
    this.set({firstName,lastName})
}).get(function(){
    return `${this.firstName} ${this.lastName}`
})

const User = mongoose.model("User",userSchema)


export default User