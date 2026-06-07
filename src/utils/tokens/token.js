import jwt from "jsonwebtoken"
import { ACCESS_EXPIRES,
    REFRESH_EXPIRES,
    TOKEN_ACCESS_ADMIN_SECRET_KEY,
    TOKEN_ACCESS_USER_SECRET_KEY, 
    TOKEN_REFRESH_ADMIN_SECRET_KEY,
    TOKEN_REFRESH_USER_SECRET_KEY } from "../../../config/config.service.js"
import { RoleEnum, SignatureEnum } from "../enums/user.enum.js"
import { v4 as uuidv4 } from "uuid";


export const genrateToken =  ({ payload , secretKey ,options = {expiresIn:ACCESS_EXPIRES} }) =>{
    return jwt.sign(payload , secretKey ,options)
}


export const verifyToken = ({token , secretKey}) =>{

    return jwt.verify(token,secretKey)
}


export const getSignature =  ({signatureLevel = SignatureEnum.User }) =>{
    let signature = {accessSignature : undefined , refreshSignature: undefined}

    switch(signatureLevel){
        case SignatureEnum.Admin:
            signature.accessSignature = TOKEN_ACCESS_ADMIN_SECRET_KEY
            signature.refreshSignature = TOKEN_REFRESH_ADMIN_SECRET_KEY
            
            break;
        case SignatureEnum.User:
            signature.accessSignature = TOKEN_ACCESS_USER_SECRET_KEY
            signature.refreshSignature = TOKEN_REFRESH_USER_SECRET_KEY
            break;

            default:
            signature.accessSignature = TOKEN_ACCESS_USER_SECRET_KEY
            signature.refreshSignature = TOKEN_REFRESH_USER_SECRET_KEY
    }

    return signature;


}


export const getNewLoginCredentials = async (user) =>{

    const signature = await getSignature({signatureLevel: 
        user.role != RoleEnum.Admin ? SignatureEnum.User : SignatureEnum.Admin})
    
    const jwtid = uuidv4()
    
    const accessToken = genrateToken({
        payload:{id : user._id},
        secretKey: signature.accessSignature,
        options:{expiresIn:ACCESS_EXPIRES ,jwtid }
    })

    const refreshToken = genrateToken({
        payload:{id : user._id},
        secretKey: signature.refreshSignature,
        options:{expiresIn:REFRESH_EXPIRES , jwtid }
    })
    return {accessToken , refreshToken}
}