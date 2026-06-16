import express from "express"
import authRouter from "./modules/Auth/auth.controller.js"
import userRouter from "./modules/User/user.controller.js"
import { successResponse } from "./utils/response/success.resonse.js"
import { globalErrorHandler, NotFoundException } from "./utils/response/error.response.js"
import connectDB from "./DB/connection.js"
import cors from "cors"
import { connectRedis } from "./DB/redis.connection.js"
import messageRouter from "./modules/message/message.controller.js"

const app = express()

app.use(express.json())
app.use(cors())
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

