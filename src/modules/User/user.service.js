import { findByIdAndUpdate } from "../../DB/database.repository.js"
import User from "../../DB/models/user.model.js"
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