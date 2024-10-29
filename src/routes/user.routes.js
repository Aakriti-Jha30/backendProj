import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

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

export  default router



