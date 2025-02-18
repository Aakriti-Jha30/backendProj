//Verify if user is present or not
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

export const verifyJWT=asyncHandler(async(req,_,next)=>{

   try {
     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
 
     if(!token){
         return new ApiError(401,"Unautorized Request");
     }
 
     const decodeToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
 
     const user=await User.findById(decodeToken?._id).select("-password -refreshToken");
 
     if(!user){
         throw new ApiError(401,"invalid token")  //discuss about frontend
     }
 
     req.user=user;
     next();  //Taaki hum aage badh ske eg-verifyJWT hogaya to ab logout pe badh sake
   } catch (error) {
    throw new ApiError(401,error?.message||"Invalid access token");
    
   }

}) 