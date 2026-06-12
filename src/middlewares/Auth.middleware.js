import { findById, findOne } from "../DB/database.repository.js";
import TokenModel from "../DB/models/token.model.js";
import User from "../DB/models/user.model.js";
import { get, revokeTokenKey , revokeAllTokenKey } from "../DB/redis.repository.js";
import { SignatureEnum, TokenTypeEnum } from "../utils/enums/user.enum.js";
import { BadRequestException, ForbiddenException, NotFoundException , unauthorizedException } from "../utils/response/error.response.js";
import { getSignature, verifyToken } from "../utils/tokens/token.js";

export const decodedToken = async ({authorization , tokenType = TokenTypeEnum.Access}) =>{

    const [Bearer , token] = authorization.split(" ") || []
    // Admin --> 0
    // User --> 1

    if(!Bearer || !token){
        throw BadRequestException({message:"Invalid Token"})
    }

    const signature = await getSignature({signatureLevel:SignatureEnum[Bearer]})
    

    const decoded = verifyToken({token:token,
        secretKey:tokenType === TokenTypeEnum.Access 
        ? signature.accessSignature
        : signature.refreshSignature})
    
    // check if the token is rovked or not --> check the logout from current device
    // if(await findOne({model:TokenModel, filter:{jti:decoded.jti}})){
    //     throw unauthorizedException({message:"Token is revoked"})
    // }

    // check revoked token with Redis --> single logout
    const isRevoked = await get({
        key: revokeTokenKey({userId: decoded.id , jti : decoded.jti})
    })

    if(isRevoked){
       throw unauthorizedException({message:"Token is revoked"}) 
    }

    const user = await findById({model:User, id:decoded.id})

    if(!user){
        throw NotFoundException({message:"Not Registered Account"})
    }
    // check if the token is expired or not --> check the change credentials time --> for logout from all devices option with MongoDB
    if(user.changeCredentialsTime?.getTime() > decoded.iat * 1000){
        throw unauthorizedException({message:"Token is expired"})
    }

    // check if the token is expired or not --> check the change credentials time --> for logout from all devices option with Redis
     const logoutAllTime = await get({
        key: revokeAllTokenKey({userId: decoded.id})
     })   
        
    if(logoutAllTime && logoutAllTime > decoded.iat){
        throw unauthorizedException({message:"Token is expired"})
    }


    return {user , decoded}



}


export const authentication = ({tokenType = TokenTypeEnum.Access}) =>{
    return async (req , res , next) =>{
        const { user, decoded } = await decodedToken ({
            authorization:req.headers.authorization,
            tokenType,
        }) || {}

        req.user = user
        req.decoded = decoded

        return next()
    }
}


export const authorization = ({accessRoles = []}) =>{
    return async (req , res , next) =>{
        if(!accessRoles.includes(req.user.role)){
            throw ForbiddenException({message:"Unauthorized access"})
        }
        return next()
    }
}