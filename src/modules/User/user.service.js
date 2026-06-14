import { findByIdAndUpdate, findOneAndUpdate } from "../../DB/database.repository.js"
import User from "../../DB/models/user.model.js"
import { RoleEnum } from "../../utils/enums/user.enum.js"
import { ForbiddenException, unauthorizedException } from "../../utils/response/error.response.js"
import {successResponse} from "../../utils/response/success.resonse.js"
import { decrypt } from "../../utils/security/encryption.security.js"


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