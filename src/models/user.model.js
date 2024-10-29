import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new mongoose.Schema(
    {
    username:{ 
      type:String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true,
      index:true, ///Makes the fields searchable in mongoDb in an optimisable way,even though a little expensive
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudnary url
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required'],
    },
    refreshToken:{
        type:String
    }
}
,{timestamps:true});

userSchema.pre("save",async function(next){
//These functions take time and hence a lot of times takes time
   if(!this.isModified("password")) return next(); //Prevents the rest of the function from executing

   this.password=await bcrypt.hash(this.password,10);
   next();
});

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,{
            //expiry
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
          
        },
        process.env.REFRESH_TOKEN_SECRET,{
            //expiry
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};
export const User=mongoose.model('User',userSchema);