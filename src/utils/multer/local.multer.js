import multer from "multer"
import path from "path"
import fs from "node:fs"

export const fileValidation = {
    images:["image/jpeg","image/png","image/gif","image/webp"],
    pdf:["application/pdf"],
    excel:["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"],
    documents:["application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    videos:["video/mp4","video/mpeg","video/quicktime"],
    audio:["audio/mpeg","audio/wav","audio/ogg"]
}


export const localFileUpload = ({customPath = "general" , validation}) => {

    const basePath = `uploads/${customPath}`

    const storage = multer.diskStorage({
        destination:(req,file,cb) =>{
            let userBasePath = basePath
            if(req.user?._id) {
                userBasePath += `/${req.user._id}`
            }
            const fullPath = path.resolve(`./src/${userBasePath}`)
            if(!fs.existsSync(fullPath)){
                fs.mkdirSync(fullPath, {recursive:true})
            }
            cb(null,path.resolve(fullPath))
        },
        filename:(req,file,cb) =>{
            const uniqueFileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname
            cb(null,uniqueFileName)
        file.finalPath = `${basePath}/${req.user._id}/${uniqueFileName}`
        }

    })

    const fileFilter = (req,file,cb) => {
        if(validation && !validation.includes(file.mimetype)){
            console.log("file type not allowed", file.mimetype)
            return cb(new Error("Invalid file type"),false)
        }else{
            cb(null,true)
        }
    }
        
    return multer({fileFilter:fileFilter,storage:storage})
}

// example Path
// uploads/users/_id/files
// uploads/users/_id/files
