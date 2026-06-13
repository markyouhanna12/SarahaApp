import { GenderEnum, ProviderEnum, RoleEnum } from "../utils/enums/user.enum.js";
import { BadRequestException } from "../utils/response/error.response.js";
import joi from "joi"

export const generalFields = {
    firstName : joi
        .string()
        .alphanum()
        .min(2)
        .max(25)
        .messages({
            "any.required":"First Name is required",
            "string.empty":"First Name cannot be empty",
            "string.alphanum":"First Name must contain only letters and numbers",
            "string.min":"First Name must be at least 2 characters",
            "string.max":"First Name must be at most 25 characters"
        })
        ,
    
         lastName : joi
         .string()
        .alphanum()
        .min(2)
        .max(25)
        .messages({
            "any.required":"Last Name is required",
            "string.empty":"Last Name cannot be empty",
            "string.alphanum":"Last Name must contain only letters and numbers",
            "string.min":"Last Name must be at least 2 characters",
            "string.max":"Last Name must be at most 25 characters"
        })
        ,
    
        email : joi
        .string()
        .email({
            minDomainSegments: 1,
            maxDomainSegments:3,
            tlds:{allow:["com","net","org"]}
        })
        .messages({
            "any.required":"Email is required",
            "string.empty":"Email cannot be empty",
            "string.email":"Invalid email format"
        }),
    
    
        age : joi
        .number()
        .integer()
        .min(18)
        .max(50),
        isActive:joi.boolean()
        .truthy("true","1",1,"Done","Yes")
        .falsy("false","0",0,"Not Done","No"),
    
        password : joi
        .string()
        .min(8)
        .max(25)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
        .messages({
            "any.required":"Password is required",
            "string.empty":"Password cannot be empty",
            "string.min":"Password must be at least 8 characters",
            "string.max":"Password must be at most 25 characters",
            "string.pattern.base":"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        }),

        
        confirmPassword: joi.ref("password"),
    
        phone : joi
        .string()
        .pattern(new RegExp(/^01[0125]{1}[0-9]{8}$/)),

        id: joi.string().custom((value, helpers) =>{

            return ( Types.ObjectId.isValid(value) || helpers.message("Invalid ObjectId format") )
        }),

        gender: joi.string().valid(... Object.values(GenderEnum)),
        role: joi.string().valid(... Object.values(RoleEnum)),
        provider: joi.string().valid(... Object.values(ProviderEnum)),

        file:{
            fieldname : joi.string(),
            originalname : joi.string(),
            encoding : joi.string(),
            mimetype : joi.string(),
            destination : joi.string(),
            filename : joi.string(),
            path : joi.string(),
            size : joi.number(),
            finalPath : joi.string()
        },
        otp: joi.string().pattern(/^[0-9]{6}$/)
    
}




export const validation  = (schema) =>{
    return (req,res,next)=>{

        const validationError = []
        
        for (const key of Object.keys(schema)) {

            const validationResults = schema[key].validate(req[key] , {
                abortEarly: false
            })
            console.log(`validation Results for ${key}:`,validationResults);
            
            if(validationResults.error){
                validationError.push({key , details:validationResults.error.details})
            }


            if(validationError.length){
                throw BadRequestException({message: "Validation Error"},validationError)
            }

            return next()
            
            
        }

}

}