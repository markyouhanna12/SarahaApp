import { redisClient } from "./redis.connection.js";

export const revokeTokenKeyPrefix = ({userId}) =>{
    return `user:revokedTokens:${userId}`
}
export const revokeTokenKey = ({userId , jti}) =>{
    return `${revokeTokenKeyPrefix({userId})}:${jti}` //--> user:revokedTokens:userId:jti
}

export const revokeAllTokenKey = ({userId}) => {
    return `revokeAll:${userId}`;
}

export const otpKey = ({email}) => {
    return `otp:${email}`;
}

export const otpAttemptsKey = ({email}) => {
    return `otpAttempts:${email}`;
}

export const recoverAccountKey = ({email}) => {
    return `recoverAccount:${email}`;
}

export const recoverAccountAttemptsKey = ({email}) => {
    return `recoverAccountAttempts:${email}`;
}

// increment a numeric key (returns the value after incrementing)
export const incr = async ({key}) =>{
    try {
        return await redisClient.incr(key)
    } catch (error) {
        console.log("Redis Incr Error",error);
    }
}

export const set = async ({key, value , ttl = null}) =>{
    try {
        const data = typeof value != "string" ? JSON.stringify(value) :value

        if(ttl){
        return await redisClient.set(key,data,
            {
                expiration:{type:"EX",value:ttl}
        })
        } else {
        return await redisClient.set(key,data)
    }
           
    } catch (error) {
        console.log("Redis Set Error",error);
        
    }
}

// get value from redis
export const get = async ({key}) =>{
    try {
        return await redisClient.get(key)
        
    } catch (error) {
        console.log("Redis Get Error",error);
    }
}

// delete value from redis
export const del = async (key) =>{
    try {
        const isExist = await redisClient.exists(key)
        if(!isExist){
            return false
        }
        return await redisClient.del(key)
        
    } catch (error) {
        console.log("Redis Delete Error",error);
   
    }
}

// update value in redis
export const update = async ({key, value , ttl = null}) =>{
    try {
        const isExist = await redisClient.exists(key)

        if(!isExist){
            return false
        }

        const data = typeof value != "string" ? JSON.stringify(value) :value

        if(ttl){
            return await redisClient.set(key,data,
                {
                    expiration:{type:"EX",value:ttl}
            })
        }
            return await redisClient.set(key,data)

    } catch (error) {
        console.log("Redis Update Error",error);
    }
}

// expire key in redis
export const expire = async ({key, ttl}) =>{
    try {
        const isExist = await redisClient.exists(key)
        if(!isExist){
            return false
        }
        return await redisClient.expire(key,ttl)
        
    } catch (error) {
        console.log("Redis Expire Error",error);      
    }
}

export const ttl = async (key) =>{
    try {
        const isExist = await redisClient.exists(key)
        if(!isExist){
            return false
        }
        return await redisClient.ttl(key)
        
    } catch (error) {
        
        console.log("Redis TTL Error",error);
    }
}

export const keys = async (pattern) =>{
    try {
        return await redisClient.keys(pattern)
        
    } catch (error) {
        console.log("Redis Keys Error",error);
    }
}