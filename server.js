import dotenv from "dotenv"
import {PORT} from "./config/config.service.js"
import app from "./src/app.js"


const startServer = async () =>{
    try {
        
        app.listen(PORT,()=>{
            console.log(`Server running on port ${PORT}`);
            
        })

    } catch (error) {
        console.log(error);
 
    }
}

startServer()


