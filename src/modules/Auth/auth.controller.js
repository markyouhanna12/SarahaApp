import express from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js"
import { validation } from "../../middlewares/Validation.middleware.js";
import { authentication, authorization } from "../../middlewares/Auth.middleware.js";
import { TokenTypeEnum } from "../../utils/enums/user.enum.js";

const router = express.Router()


router.post("/signup",validation(authValidation.signupSchema),authService.signup)
router.post("/login",validation(authValidation.loginSchema),authService.login)
router.post("/refresh-token",authService.refreshToken)

router.post("/social-login",authService.loginWithGoogle)

router.post("/logout",
    authentication({tokenType:TokenTypeEnum.Access})
    ,authService.logout)

export default router