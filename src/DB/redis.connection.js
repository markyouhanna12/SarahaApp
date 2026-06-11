import { createClient } from "redis";
import { RedisUrl } from "../../config/config.service.js"

export const redisClient = createClient({
    url:RedisUrl
})

export const connectRedis = async ()=>{
    try {
        await redisClient.connect()
        console.log("Connected to Redis successfully");

        
    } catch (error) {

        console.error("Error connecting to Redis:",error);
        
        
    }
}

