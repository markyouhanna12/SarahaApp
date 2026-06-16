import { WHITE_LIST } from "../../../config/config.service.js"


export const corsOptions = () =>{
    const whiteList = WHITE_LIST.split(",")
    const corsOptions = {
        origin: function(origin, callback){
            if(whiteList.includes(origin)){
                callback(null, true)

            }else if(!origin){    
                callback(null, true)

            }else{
                
                callback(new Error("Not allowed by CORS"))
            }
        },
        methods:["GET","POST" , "PATCH" , "DELETE" , "PUT"]
    }

    return corsOptions
}

