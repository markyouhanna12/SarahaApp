import { BadRequestException } from "../utils/response/error.response.js";

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