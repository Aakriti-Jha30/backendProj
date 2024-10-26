import {asyncHandler} from '../utils/asyncHandler.js'

//This syntax is used a lot of times
const registerUser=asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"User registered Successfully",
    })
})

export {registerUser};