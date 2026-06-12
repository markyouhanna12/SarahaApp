import User from "../../DB/models/user.model.js"
import {create, findOne, findById, updateOne, findByIdAndUpdate} from "../../DB/database.repository.js"
import {BadRequestException, ConflictException, NotFoundException, TooManyRequestsException} from "../../utils/response/error.response.js"
import {successResponse} from "../../utils/response/success.resonse.js"
import {genrateHash,compareHash} from "../../utils/security/hash.security.js"
import { HashEnum } from "../../utils/enums/security.enum.js"
import { encrypt , decrypt } from "../../utils/security/encryption.security.js"
import { genrateToken, getNewLoginCredentials, getSignature, verifyToken } from "../../utils/tokens/token.js"
import {ACCESS_EXPIRES,
    REFRESH_EXPIRES,
    TOKEN_REFRESH_ADMIN_SECRET_KEY,
    TOKEN_REFRESH_USER_SECRET_KEY,
    TOKEN_ACCESS_ADMIN_SECRET_KEY,
    TOKEN_ACCESS_USER_SECRET_KEY,
    Client_ID,
    OTP_TTL,
    MAX_OTP_TRIALS,
    OTP_WINDOW} from "../../../config/config.service.js"

import {OAuth2Client} from "google-auth-library"
import { GenderEnum, LogoutTypeEnum, ProviderEnum } from "../../utils/enums/user.enum.js"

import { signupSchema } from "./auth.validation.js"
import TokenModel from "../../DB/models/token.model.js"
import { otpKey, otpAttemptsKey, revokeAllTokenKey, revokeTokenKey, set, get, incr, expire, ttl, del } from "../../DB/redis.repository.js"
import { generateOTP } from "../../utils/generateOTP.js"
import { emailSubject, sendEmail } from "../../utils/email/email.utils.js"
import { emailEvent } from "../../utils/events/email.events.js"


export const signup = async (req, res) => {
    const {firstName, lastName, email, password , phone} = req.body


    // check if the user already exists
    const user = await findOne({model:User, filter:{email}})


    if(user){
        throw ConflictException({message:"User Already Exists"})      
    }

    const hashedPassword = await genrateHash({plaintext:password,algorithm:HashEnum.Argon})

    const encryptedData = await encrypt(phone)
    
    const otp = generateOTP()

    const hashedOtp = await genrateHash({plaintext:otp,algorithm:HashEnum.Argon})


    const newUser = await create({model:User,
        data:[{
            firstName, 
            lastName,
            email, 
            password:hashedPassword ,
            phone:encryptedData ,
            cofirmEmailOTP :hashedOtp }]})

    // await sendEmail({to:email , subject:emailSubject.confirmEmial , text : otp})
    // we need to make the sendEmail as call event to reduce the time of signup service (2.55 s -> 244 ms)

    emailEvent.emit("confirmEmail", {to:email , otp , firstName})


    return successResponse({res,statusCode:201,message:"User Created successfully",data:{newUser}})

}

export const confirmEmail = async (req,res) =>{
    const {email ,otp} =req.body
    const user = await findOne({
        model:User,
        filter:{
            confirmEmail: {$exists:false},
            cofirmEmailOTP: {$exists:true}

        }
    })
    if(!user){
        throw NotFoundException({message:"User not found"})
    }

    const isOtpValid = await compareHash({
        plaintext:otp,
        ciphertext:user.cofirmEmailOTP,
        algorithm:HashEnum.Argon
    })

    if(!isOtpValid){
        throw BadRequestException({message:"Invalid otp"})
    }

    await updateOne({
        model:User,
        filter:{email},
        update:{confirmEmail:Date.now(), $unset: {cofirmEmailOTP :true}}
    })

    return successResponse({
        res,
        statusCode:200,
        message:"Email confirmed successfully"
    })



}


export const login = async (req, res) => {
    const {email ,password} = req.body
    const user = await findOne({
        model:User, 
        filter:{email , confirmEmail:{$exists : true}}})

    if(!user){
        throw NotFoundException({message:"Invalid email or password"})
    }

    const isPasswordValid = await compareHash(
        {plaintext:password,ciphertext:user.password,algorithm:HashEnum.Argon})

    if(!isPasswordValid){
        throw BadRequestException({message:"Invalid email or password"})
    }

    const credentials = await getNewLoginCredentials(user)

    return successResponse({res,statusCode:200,message:"Login successfully",data:credentials})
}


export const refreshToken = async (req, res) => {

    const {authorization} = req.headers

    const decodedToken =  await verifyToken(
        {   token:authorization,
            secretKey:TOKEN_REFRESH_ADMIN_SECRET_KEY
        })


    
    const user = await findById({model:User, id: decodedToken._id})

    if(!user){
        throw NotFoundException({message:"User Not Found"})
    }

    const accessToken = await genrateToken({
        payload:{id:user._id},
        secretKey:TOKEN_ACCESS_ADMIN_SECRET_KEY
    })

    return successResponse({
        res,statusCode:200,
        message:"Token successfully refreshed",
        data:{accessToken}})


}


async function verifyGoogleAccount ({idToken}){

    const client = new OAuth2Client()
    const ticket = await client.verifyIdToken({
        idToken,
        audience:Client_ID
    })

    const payload = ticket.getPayload()

    return payload;

}



export const loginWithGoogle = async (req,res) =>{

    const {idToken} = req.body
    // verify with Google Auth Library
  const {email , picture , given_name , family_name , email_verified } = await verifyGoogleAccount({idToken})

  // logic bussiness
  if(!email_verified){
    throw BadRequestException({message:"Email not verifed"})
  }

  let user = await findOne({model:User, filter:{email}})

  if (!user) {
    user = await create({
      model: User,
      data: [{
        firstName: given_name,
        lastName: family_name,
        email,
        profilePic: picture,
        provider: ProviderEnum.Google,
      }],
    });

}else if (user.provider === ProviderEnum.System) {
    throw BadRequestException({
      message:
        "This email already exists with email/password login",
    });
  }

   const credentials = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: user.createdAt === user.updatedAt ? 201 : 200,
    message: "Login successfully",
    data: credentials,
  });

}
// logout with ttl with mongoDB
export const logout = async (req,res) =>{

    const {flag} = req.body
    // flag ==> // signoutFromAll ,  onlyOneDevice

    let status = 200
    switch (flag){
        case LogoutTypeEnum.logout:
            await create({model:TokenModel, 
                data:[
                {
                    jti: req.decoded.jti,
                    userId: req.user._id,
                    expiresIn:Date.now() - req.decoded.exp,
                }
            ]})
            status = 201;
            break;
        case LogoutTypeEnum.logoutFromAll:
            await findByIdAndUpdate({
                model:User, 
                id:{_id:req.user._id}, 
                update:{changeCredentialsTime:Date.now()}})
            status = 200
            break;
    }

    return successResponse({
        res, message:"Logout Successfully",
        statusCode: status
    })

}


export const logoutWithRedis = async (req,res) =>{

    const {flag} = req.body
    // flag ==> // signoutFromAll ,  onlyOneDevice

    let status = 200
    switch (flag){
        case LogoutTypeEnum.logout:
            await set({
                key:revokeTokenKey({userId:req.user._id, jti:req.decoded.jti}),
                 value:req.decoded.jti, 
                 ttl:req.decoded.exp - Math.floor(Date.now()/1000)
            })
            status = 201;
            break;
            
        case LogoutTypeEnum.logoutFromAll:
            await set({
                key:revokeAllTokenKey({
                    userId:req.user._id
                }),
                value: Math.floor(Date.now()/1000),
            })
            status = 200
            break
            
}
    return successResponse({
        res, message:"Logout Successfully",
        statusCode: status
    })

}

export const resendOTP = async (req,res) =>{
    const {email} = req.body


    const user = await findOne({
        model:User,
        filter:{email , confirmEmail:{$exists:false}}
    })
    if(!user){
        throw NotFoundException({message:"User not found or already confirmed"})
    }

    // if a valid (non-expired) OTP already exists, ask the user to wait
    const existingOtp = await get({key:otpKey({email})})
    if(existingOtp){
        const remaining = await ttl(otpKey({email}))
        // remaining > 0 -> still valid; (-1 = no expiry, -2 = no key) -> clean up and allow a new one
        if(remaining > 0){
            throw TooManyRequestsException({message:`An OTP was already sent. Please wait ${remaining}s before requesting a new one.`})
        }
        await del(otpKey({email}))
    }

    // enforce a maximum number of OTP requests per window
    const trials = await incr({key:otpAttemptsKey({email})})
    if(trials === 1){
        // first request in this window: start the expiry window for the counter
        await expire({key:otpAttemptsKey({email}), ttl:OTP_WINDOW})
    }
    if(trials > MAX_OTP_TRIALS){
        throw TooManyRequestsException({message:"Maximum OTP requests reached. Please try again later."})
    }

    const otp = generateOTP()
    const hashedOtp = await genrateHash({plaintext:otp, algorithm:HashEnum.Argon})

    // store the hashed OTP in redis with a 1 minute expiry
    await set({key:otpKey({email}), value:hashedOtp, ttl:OTP_TTL})

    // keep the DB in sync so confirmEmail can validate the latest OTP
    await updateOne({
        model:User,
        filter:{email},
        update:{cofirmEmailOTP:hashedOtp}
    })

    emailEvent.emit("confirmEmail", {to:email , otp , firstName:user.firstName})

    return successResponse({
        res, message:"OTP sent successfully"
    })
}