import express from "express"
import authRouter from "./modules/Auth/auth.controller.js"
import userRouter from "./modules/User/user.controller.js"
import messageRouter from "./modules/message/message.controller.js"
import { globalErrorHandler, NotFoundException } from "./utils/response/error.response.js"
import connectDB from "./DB/connection.js"
import cors from "cors"
import { connectRedis } from "./DB/redis.connection.js"
import { corsOptions } from "./utils/cors/cors.utils.js"
import helmet from "helmet"
import { attachRouterWithLogger } from "./logger/morgan.logger.js"
import chalk from "chalk"
import { rateLimit } from "express-rate-limit"
import { customRateLimiter } from "./middlewares/rateLimitter.middleware.js"

const app = express()

app.use(express.json())
app.use(cors(corsOptions()))
app.use(helmet())

app.use(customRateLimiter)

attachRouterWithLogger(app , "/auth" ,authRouter , "auth.log" )
attachRouterWithLogger(app , "/user" ,userRouter , "user.log" )
attachRouterWithLogger(app , "/message" ,messageRouter , "message.log" )

await connectDB()
await connectRedis()



app.use("/uploads",express.static("./src/uploads"))


app.all("/*dummy",(req,res)=>{
    throw chalk.red(NotFoundException({message:"Not found Handler!!"}))
})

app.use(globalErrorHandler)

export default app;

