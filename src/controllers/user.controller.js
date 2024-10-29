import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend(Postman se hum data lelenge),lya details lenge depends on model
    //validation(frontend,backend donon mei dehte ye+not empty check)
    //check if user already exisits:username,email
    //check if files are present:avatar,images
    //upload them to cloudinary:check if avatar uploaded it successfully
    //create user object-create entry in database
    //remove password and refresh token field from response
    //check if response is recieved or not(user creation)
    //return response


    const {fullname,email,username,password}=req.body;
    console.log(req.body);
    console.log("email:",email);

    if([fullname,email,username,password].some((field)=>field?.trim==="")){
        throw new ApiError(400,"All fields are required");
    }
    //put an additional check for email later
    //CHECK IF USER ALREADY EXISTS

    const existingUser=User.findOne({
        $or:[{username},{email}]
    })

    if(existingUser){
    throw new ApiError(409,"User already Exists");
    }

    const avatarlocalPath=req.files?.avatar[0]?.path;
    const coverImagelocalPath=req.files?.coverImage[0]?.path;

    if(!avatarlocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    //console.log(req.files);

    //This step will always take time
    const avatar=await uploadOnCloudinary(avatarlocalPath);
    const coverImage=await uploadOnCloudinary(coverImagelocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase(),
    })

    const createdUser=await User.findById(user._id).select(
        "-password  -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")

    )

   

})

export {registerUser};

