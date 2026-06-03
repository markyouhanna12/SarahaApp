import joi from "joi"


export const signupSchema = {
    body: joi.object({
    firstName : joi
    .string()
    .alphanum()
    .min(2)
    .max(25)
    .messages({
        "any.required":"First Name is required",
        "string.empty":"First Name cannot be empty",
        "string.alphanum":"First Name must contain only letters and numbers",
    })
    .required(),

     lastName : joi
     .string()
    .alphanum()
    .min(2)
    .max(25)
    .messages({
        "any.required":"Last Name is required",
        "string.empty":"Last Name cannot be empty",
        "string.alphanum":"Last Name must contain only letters and numbers",
    })
    .required(),

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
})
    .required(),


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
    })
    .required(),

    phone : joi
    .string()
    .pattern(new RegExp(/^01[0125]{1}[0-9]{8}$/))

})

}




export const loginSchema = {
    body: joi.object({

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
})
    .required(),

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
    })
    .required()

})

}