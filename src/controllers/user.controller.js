import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshTokens=async(userId)=>{

    try{
        const user=await User.findById(userId); //got the document use methods
        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }
        
        console.log("User methods:", user.generateAccessToken, user.generateRefreshToken);

        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};



    }catch(error){
        console.error("Error generating tokens:", error);
        throw new ApiError(500,"Something went wrong while generating access and refrest token")
    }

}


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

    const existingUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existingUser){
    throw new ApiError(409,"User already Exists");
    }

    console.log("Uploaded Files:", req.files);

    const avatarlocalPath=req.files?.avatar[0]?.path;
    //const coverImagelocalPath=req.files?.coverImage[0]?.path;

    let  coverImagelocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImagelocalPath=req.files.coverImage[0].path;
    }


    console.log(avatarlocalPath);
    console.log(coverImagelocalPath);

    if(!avatarlocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    console.log(req.files);

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

const loginUser=asyncHandler(async(req,res)=>{

    //username or email(donon mei se kisi ek pe login kar skta hai)
    //check for it
    //confirm password
    //access and refresh token generate and send both to user
    //send this to (cookies=>secure cookies)
    //successful login
    const{username,password,email}=req.body;

    if(!username && !email){
        throw new ApiError(400,"Username or password is required")
    }
    const findUser = await User.findOne({
        $or: [{ username: username }, { email: email }]
    });
    
    if(!findUser){
        throw new ApiError(404,"User Not Registered");
    }


    const isValid=await findUser.isPasswordCorrect(password); 
    if(!isValid){
        throw new ApiError(401,"Invalid user credentials");

    }

    //generate access and refresh token(let's make a seperate method)
    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshTokens(findUser._id);

    const loggedInUser=await User.findById(findUser._id).select("-password -refreshToken ").lean();

    //send in cookies
    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                findUser:loggedInUser,accessToken,
                refreshToken
            },
            "User loggesd in succesfully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    //deleted refeshToken from database
   await User.findByIdAndUpdate(req.user._id
    ,{
        $set:{
            refreshToken:undefined
        }
    },{
        new:true,
    }
   )
   //remove access token from req.cookies
   const options={
    httpOnly:true,
    secure:true,
}

   return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User logged out"));


})

const refreshAccessToken=asyncHandler(async(req,res)=>{

    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }

try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
    
        )
    
        const user=await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid refresh Toekn");
        }
    
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used");
    
        }
        
        const options={
            httpOnly:true,
            secure:true,
        }
        const accesstoken=await generateAccessTokenAndRefreshTokens(user._id);
        const refreshtoken=await generateAccessTokenAndRefreshTokens(user._id);
        
        return res.status(200).cookie("accessToken",accesstoken,options).cookie("refreshToken",refreshtoken,options).json(
            new ApiResponse(
                200,{accesstoken,refreshtoken},"Access Token Refreshed"
            )
        )
} catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token");
    
}



})


export { registerUser, loginUser, logoutUser ,refreshAccessToken };


