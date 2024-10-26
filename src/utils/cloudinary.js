import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET ,
});

//We will handle file upload in a little organized manner i.e. we will make a method where we will pass the path of the file uploaed in server,
//if rightly uploaded we will unlink the file from the server


const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,
            {
                resource_type:"auto"
            }
        )
        //file has been uploaded successfully
        console.log("File is uploaded on cloudinary",response.url);
       // console.log(response);
       return response;
    }catch(error){
      //server se hata do corrupted file na rahe
      fs.unlinkSync(localFilePath); //Remove the locally saved temporary file as the upload operation got failed
      return null;
    }
}

export {uploadOnCloudinary};

