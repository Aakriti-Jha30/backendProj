import multer from "multer"

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        cb(null,file.originalname); //not so good but since it will be there for as it will be kept in server for little time
    }
})

export const upload=multer({storage,})