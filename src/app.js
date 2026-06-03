import express from "express"
import authRouter from "./modules/Auth/auth.controller.js"
import userRouter from "./modules/User/user.controller.js"
import { successResponse } from "./utils/response/success.resonse.js"
import { globalErrorHandler, NotFoundException } from "./utils/response/error.response.js"
import connectDB from "./DB/connection.js"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors())
await connectDB()

app.use("/auth",authRouter)
app.use("/user",userRouter)

app.all("/*dummy",(req,res)=>{
    throw NotFoundException({message:"Not found Handler!!"})
})

app.use(globalErrorHandler)

export default app;

