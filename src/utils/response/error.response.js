export const ErrorResponse = ({
    message = "Error",
    status = 400,
    extra = undefined,
}) =>{
    let error;
    if(typeof message === "string"){
        error = new Error (message)
    }else if (message?.message){
        error = new Error(message.message)
    }else{
        error = new Error("Error")
    }
    error.status = status
    error.extra = extra

    throw error
};


export const BadRequestException = (
    message= "BadRequestException",extra = undefined)=>{

        return ErrorResponse({message,status:400,extra})

}


export const ConflictException = (
    message= "ConflictException", extra = undefined)=>{

        return ErrorResponse({message,status:409,extra})

}


export const unauthorizedException = (
    message= "unauthorizedException" , extra = undefined)=>{

        return ErrorResponse({message,status:401,extra})

}


export const NotFoundException = (
    message= "NotFoundException" , extra = undefined)=>{

        return ErrorResponse({message,status:404,extra})

}



export const ForbiddenException = (
    message= "ForbiddenException" , extra = undefined)=>{

        return ErrorResponse({message,status:403,extra})

}



export const TooManyRequestsException = (
    message= "TooManyRequestsException" , extra = undefined)=>{

        return ErrorResponse({message,status:429,extra})

}




export const globalErrorHandler = (error,req,res,next) =>{
    const status = error.status ?? 500;
    const extra = error.extra || undefined
    return res.status(status).json({message:error.message, stack:error.stack , status , extra})
}