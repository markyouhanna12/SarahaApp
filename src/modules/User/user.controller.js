import express from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../middlewares/Auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../utils/enums/user.enum.js";
import { fileValidation, localFileUpload } from "../../utils/multer/local.multer.js";

const router = express.Router()


router.get("/",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.Admin]}),
    userService.getProfile)

    
router.patch("/update-profile-pic",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User]}),
    localFileUpload({customPath:"User" , validation:[...fileValidation.images]}).single("attachments"),
    userService.updateProfilePic)


router.patch("/update-profile-Cover",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User]}),
    localFileUpload({customPath:"User" , validation:[...fileValidation.images]}).array("attachments",5),
    userService.updateCoverPic)
  


export default router