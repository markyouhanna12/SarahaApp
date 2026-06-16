import { create, find, findById } from "../../DB/database.repository.js";
import messageModel from "../../DB/models/message.model.js";
import User from "../../DB/models/user.model.js";
import { NotFoundException } from "../../utils/response/error.response.js";
import { successResponse } from "../../utils/response/success.resonse.js";


export const sendMessage = async (req,res) =>{
    const {receiverId} = req.params;
    const {content} = req.body;


    const user = await findById({
        model:User,
        id:receiverId
    })

    if(!user){
        throw NotFoundException({message:"Receiver not found"})
    }

    const message = await create({
        model:messageModel,
        data:[{
            receiverId: user._id,
            content
        }]
    })
    console.log(message);
    if(!message){
        throw NotFoundException({message:"Message not sent"})
    }

    return successResponse({
        res,
        statusCode:201,
        message:"Message sent successfully", 
        data: {message}
    })
}



export const getMessagesAdmin = async (req,res) =>{
    // we need to get all messages in the model
    const messages = await find({
        model:messageModel
    })

    return successResponse({
        res,
        statusCode:200,
        message:"Messages retrieved successfully", 
        data:{messages}
    })
}


export const getMessages = async (req,res) =>{

    const user = req.user;

    // content only without _id
    const messages = await find({
        model:messageModel,
        filter:{receiverId:user._id},
        select:"content -_id"
    })

    return successResponse({
        res,
        statusCode:200,
        message:"Messages retrieved successfully", 
        data:{messages}
    })

}