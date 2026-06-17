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
import morgan from "morgan"
import { attachRouterWithLogger } from "./logger/morgan.logger.js"

const app = express()

app.use(express.json())
app.use(cors(corsOptions()))
app.use(helmet())
attachRouterWithLogger(app , "/auth" ,authRouter , "auth.log" )
attachRouterWithLogger(app , "/user" ,userRouter , "user.log" )
attachRouterWithLogger(app , "/message" ,messageRouter , "message.log" )


await connectDB()
await connectRedis()

app.use("/uploads",express.static("./src/uploads"))
app.use("/auth",authRouter)
app.use("/user",userRouter)
app.use("/message",messageRouter)


app.all("/*dummy",(req,res)=>{
    throw NotFoundException({message:"Not found Handler!!"})
})

app.use(globalErrorHandler)

export default app;

