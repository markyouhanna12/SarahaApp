import { deleteOne, findByIdAndUpdate, findOne, findOneAndUpdate } from "../../DB/database.repository.js"
import User from "../../DB/models/user.model.js"
import { RoleEnum } from "../../utils/enums/user.enum.js"
import { HashEnum } from "../../utils/enums/security.enum.js"
import { BadRequestException, ForbiddenException, NotFoundException, TooManyRequestsException, unauthorizedException } from "../../utils/response/error.response.js"
import {successResponse} from "../../utils/response/success.resonse.js"
import { decrypt } from "../../utils/security/encryption.security.js"
import { compareHash, genrateHash } from "../../utils/security/hash.security.js"
import { generateOTP } from "../../utils/generateOTP.js"
import { emailEvent } from "../../utils/events/email.events.js"
import { del, expire, get, incr, recoverAccountAttemptsKey, recoverAccountKey, set, ttl } from "../../DB/redis.repository.js"

const OTP_TTL = 60        // OTP valid for 1 minute
const MAX_OTP_TRIALS = 3  // maximum number of recovery OTPs per window
const OTP_WINDOW = 3600   // trial counter resets after 1 hour


export const getProfile = async (req,res) => {

    req.user.phone = await decrypt(req.user.phone)
    
    return successResponse({res,message:"Done",statusCode:200,data:req.user})

}



export const updateProfilePic = async (req,res) => {

    const user = await findByIdAndUpdate({model:User , id:req.user._id , update:{profilePic : req.file.finalPath}})

    return successResponse(
        {res,message:"Done",
        statusCode:200,
        data:user})

}


export const updateCoverPic= async (req,res) => {

    const user = await findByIdAndUpdate({
        model:User , 
        id:req.user._id ,
         update:{coverImages : req.files?.map(file => file.finalPath)}})

    return successResponse(
        {res,message:"Done",
        statusCode:200,
        data:user})

}

export const freezeAccount = async (req,res) =>{
    const {userId} = req.params
    console.log(userId);
    

    if(userId && req.user.role !== RoleEnum.Admin){
        throw ForbiddenException({message:"You are not authorized to freeze this account"})
    }

    const updatedUser = await findOneAndUpdate({
        model:User,
        filter:{
            _id:userId || req.user._id ,freezedAt :{$exists:false}
        },
        update:{
            freezedAt: Date.now(),
            freezedBy: req.user._id,
            $unset:{
                restoredBy:true,
                restoredAt:true
            }
        }
    })

    return successResponse({
        res,
        message:"The account has been deactivated",
        statusCode:200,
        data :{updatedUser}
    })

}

export const restoreAccount = async (req,res) =>{
    const {userId} = req.params // --> id of the freezed user
    
    const updatedUser = await findOneAndUpdate({
        model:User,
        filter:{
            _id:userId || req.user._id ,
            freezedAt :{$exists:true},
            freezedBy : {$ne : userId}
        },
        update:{
            restoredAt: Date.now(),
            restoredBy: req.user._id,
            $unset:{
                freezedAt:true,
                freezedBy:true
            }
        }
    })

    return successResponse({
        res,
        message:"The account has been restored",
        statusCode:200,
        data :{updatedUser}
    })
}

// self-service recovery (step 1): send an OTP to the email of a frozen account
export const sendRecoverAccountOTP = async (req,res) =>{
    const {email} = req.body

    const user = await findOne({
        model:User,
        filter:{email ,
            freezedAt:{$exists:true},
            freezedBy:{$exists:true}
        }
    })
    if(!user){
        throw NotFoundException({message:"No frozen account found with this email"})
    }

    const key = recoverAccountKey({email})

    // if a valid (non-expired) OTP already exists, ask the user to wait
    const existingOtp = await get({key})
    if(existingOtp){
        const remaining = await ttl(key)
        if(remaining > 0){
            throw TooManyRequestsException({message:`A recovery OTP was already sent. Please wait ${remaining}s before requesting a new one.`})
        }
        await del(key)
    }

    // enforce a maximum number of recovery requests per window
    const trials = await incr({key:recoverAccountAttemptsKey({email})})
    if(trials === 1){
        await expire({key:recoverAccountAttemptsKey({email}), ttl:OTP_WINDOW})
    }
    if(trials > MAX_OTP_TRIALS){
        throw TooManyRequestsException({message:"Maximum recovery requests reached. Please try again later."})
    }

    const otp = generateOTP()
    const hashedOtp = await genrateHash({plaintext:otp, algorithm:HashEnum.Argon})

    // store the hashed OTP in redis with a 1 minute expiry
    await set({key, value:hashedOtp, ttl:OTP_TTL})

    emailEvent.emit("recoverAccount", {to:email , otp , firstName:user.firstName})

    return successResponse({
        res,
        message:"Recovery OTP sent successfully",
        statusCode:200
    })
}

// self-service recovery (step 2): verify the OTP and unfreeze the account
export const confirmRecoverAccount = async (req,res) =>{
    const {email , otp} = req.body

    const user = await findOne({
        model:User,
        filter:{
            email,
            freezedAt:{$exists:true},
            freezedBy:{$exists:true}
        }
    })
    if(!user){
        throw NotFoundException({message:"No frozen account found with this email"})
    }

    const hashedOtp = await get({key:recoverAccountKey({email})})
    if(!hashedOtp){
        throw BadRequestException({message:"OTP expired or not found, please request a new one"})
    }

    const isOtpValid = await compareHash({
        plaintext:otp,
        ciphertext:hashedOtp,
        algorithm:HashEnum.Argon
    })
    if(!isOtpValid){
        throw BadRequestException({message:"Invalid OTP"})
    }

    const updatedUser = await findOneAndUpdate({
        model:User,
        filter:{email , freezedAt:{$exists:true}},
        update:{
            restoredAt: Date.now(),
            restoredBy: user._id, // restored by the user himself
            $unset:{
                freezedAt:true,
                freezedBy:true
            }
        }
    })

    // clean up the recovery keys
    await del(recoverAccountKey({email}))
    await del(recoverAccountAttemptsKey({email}))

    return successResponse({
        res,
        message:"Your account has been recovered successfully",
        statusCode:200,
        data :{updatedUser}
    })
}


export const hardDeleteAccount = async (req,res) =>{
    const {userId} = req.params // _id of freezed user

    const deletedAccount = await deleteOne({
        model:User,
        filter:{_id : userId , freezedAt:{$exists : true}}
    })

    return successResponse({
        res,
        message:"The account has been Deleted",
        statusCode:200,
        data :{deletedAccount}
    })

}