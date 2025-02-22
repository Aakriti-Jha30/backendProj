import {Router} from "express";
import {logoutUser, registerUser,loginUser,refreshAccessToken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/register").post(
    //ab hum image bhej sakte
    upload.fields([
        {
            name:"avatar", //name important for frontend
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),

    registerUser
)

router.route("/login").post(
    loginUser
)

//secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)


export  default router



