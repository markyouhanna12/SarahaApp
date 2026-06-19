// ip request 
const ipRequest = {}
// set --> for blocked IPs
const blockedIps = new Set()

// Map {"127.0.0.1": {count: 0, lastRequest: Date.now()}}
const unBlockerTimers = new Map()


const RATE_LIMIT = 5
const WINDOW_MS = 60 * 1000 // 1 minute

export const customRateLimiter = (req,res,next) =>{
    const ip = req.ip
    const currentTime = Date.now()
    
    if(blockedIps.has(ip)){
        return res.status(403).json({message:"Blocked IP , try again later"})
    }

    if(!ipRequest[ip]){ // new ip address
        ipRequest[ip] = {
            count: 1,
            startTime: currentTime
        }
        return next()
    }
    
    const diff = currentTime - ipRequest[ip].startTime

    if(diff < WINDOW_MS){
        ipRequest[ip].count++
        if(ipRequest[ip].count > RATE_LIMIT){
            blockedIps.add(ip)


            if(!unBlockerTimers.has(ip)){
               const timer = setTimeout(() => {
                blockedIps.delete(ip)
                unBlockerTimers.delete(ip)
               }, WINDOW_MS)
               unBlockerTimers.set(ip, timer)
            }

            return res.status(429).json({message:"Too Many requests , you are blocked"})
        }
    } else {
        ipRequest[ip] = {
            count: 1,
            startTime: currentTime
        }
    }
    
    next()
}