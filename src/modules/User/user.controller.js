import express from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../middlewares/Auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../utils/enums/user.enum.js";
import { fileValidation, localFileUpload } from "../../utils/multer/local.multer.js";
import { validation } from "../../middlewares/Validation.middleware.js";
import { coverImagesSchema, ProfilePicSchema } from "./user.validation.js";

const router = express.Router()


router.get("/",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.Admin]}),
    userService.getProfile)

    
router.patch("/update-profile-pic",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User]}),
    localFileUpload({customPath:"User" , validation:[...fileValidation.images]}).single("attachments"),
    validation(ProfilePicSchema),
    userService.updateProfilePic)


router.patch("/update-profile-Cover",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User]}),
    localFileUpload({customPath:"User" , validation:[...fileValidation.images]}).array("attachments",5),
    validation(coverImagesSchema),
    userService.updateCoverPic)
  


export default router