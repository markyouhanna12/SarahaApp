import dotenv from "dotenv"
import {PORT} from "./config/config.service.js"
import app from "./src/app.js"
import chalk from "chalk"

const startServer = async () =>{
    try {
        
        app.listen(PORT,()=>{
            console.log(chalk.bold.blue(`Server running on port ${PORT}`));
            
        })

    } catch (error) {
        console.log(chalk.red(error));
 
    }
}

startServer()



