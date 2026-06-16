import express from "express";
import * as messageService from "./message.service.js";
import { authentication, authorization } from "../../middlewares/Auth.middleware.js";
import { TokenTypeEnum, RoleEnum } from "../../utils/enums/user.enum.js";
import { validation } from "../../middlewares/Validation.middleware.js";
import { sendMessageValidation } from "./message.validation.js";

const router = express.Router()

// send messages anonymously 
router.post("/send-message/:receiverId",
    validation(sendMessageValidation),
    messageService.sendMessage)


// as admin --> get all messages from database
router.get("/get-messages-admin",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.Admin]}),
    messageService.getMessagesAdmin)

// as user --> get all messages sent to him
router.get("/get-messages",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User]}),
    messageService.getMessages)

export default router