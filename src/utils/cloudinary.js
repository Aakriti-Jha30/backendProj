import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET ,
});

cloudinary.api.ping()
    .then(res => console.log("Cloudinary Connected:", res))
    .catch(err => console.error("Cloudinary Error:", err));

//We will handle file upload in a little organized manner i.e. we will make a method where we will pass the path of the file uploaed in server,
//if rightly uploaded we will unlink the file from the server


const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if (!localFilePath) {
            console.error("❌ Local file path is undefined or empty!");
            return null;
        }

        localFilePath = localFilePath.replace(/\\/g, "/");
      //  console.log("Uploading file:", localFilePath);

        // Ensure the file exists before uploading
        if (!fs.existsSync(localFilePath)) {
            console.error("File not found:", localFilePath);
            return null;
        }

        const response=await cloudinary.uploader.upload(localFilePath,
            {
                resource_type:"auto"
            }
        )
        //file has been uploaded successfully
        console.log("File is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    }catch(error){
      //server se hata do corrupted file na rahe
      fs.unlinkSync(localFilePath); //Remove the locally saved temporary file as the upload operation got failed
      return null;
    }
}

export {uploadOnCloudinary};

