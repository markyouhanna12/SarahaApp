import express from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../middlewares/Auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../utils/enums/user.enum.js";
import { fileValidation, localFileUpload } from "../../utils/multer/local.multer.js";
import { validation } from "../../middlewares/Validation.middleware.js";
import * as userValidation from "./user.validation.js";

const router = express.Router()


router.get("/",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User , RoleEnum.Admin]}),
    userService.getProfile)

    
router.patch("/update-profile-pic",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User]}),
    localFileUpload({customPath:"User" , validation:[...fileValidation.images]}).single("attachments"),
    validation(userValidation.ProfilePicSchema),
    userService.updateProfilePic)


router.patch("/update-profile-Cover",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.User]}),
    localFileUpload({customPath:"User" , validation:[...fileValidation.images]}).array("attachments",5),
    validation(userValidation.coverImagesSchema),
    userService.updateCoverPic)
  
// freeze by user or admin
router.delete("{/:userId}/freeze-account",
    authentication({tokenType: TokenTypeEnum.Access}),
    authorization({accessRoles: [RoleEnum.User , RoleEnum.Admin]}),
    validation(userValidation.freezeAccountSchema),
    userService.freezeAccount
)
// restore user by admin
router.patch("/:userId/restore-account",
    authentication({tokenType: TokenTypeEnum.Access}),
    authorization({accessRoles: [RoleEnum.Admin]}),
    validation(userValidation.restoreAccountSchema),
    userService.restoreAccount
)

// self-service account recovery (public, OTP based)
router.post("/recover-account",
    validation(userValidation.recoverAccountSchema),
    userService.sendRecoverAccountOTP
)

router.patch("/recover-account/verify",
    validation(userValidation.confirmRecoverAccountSchema),
    userService.confirmRecoverAccount
)


// hard delete user by admin only
router.delete("/:userId/hard-delete",
    authentication({tokenType: TokenTypeEnum.Access}),
    authorization({accessRoles: [RoleEnum.Admin]}),
    validation(userValidation.hardDeleteAccountSchema),
    userService.hardDeleteAccount
)


export default router