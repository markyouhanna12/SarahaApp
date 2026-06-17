import { createClient } from "redis";
import { RedisUrl } from "../../config/config.service.js"
import chalk from "chalk";
export const redisClient = createClient({
    url:RedisUrl
})

export const connectRedis = async ()=>{
    try {
        await redisClient.connect()
        console.log(chalk.bold.green("Connected to Redis successfully"));

        
    } catch (error) {

        console.error(chalk.red("Error connecting to Redis:"),error);
        
        
    }
}

