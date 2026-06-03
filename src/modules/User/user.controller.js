import express from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../middlewares/Auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../utils/enums/user.enum.js";

const router = express.Router()


router.get("/",
    authentication({tokenType:TokenTypeEnum.Access}),
    authorization({accessRoles:[RoleEnum.Admin]}),
    userService.getProfile)

export default router