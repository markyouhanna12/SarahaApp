import multer from "multer"
import path from "path"
import fs from "node:fs"

export const localFileUpload = ({customPath = "general"}) => {

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
        
    return multer({storage}) // middleware
}

// example Path
// uploads/users/_id/files
// uploads/users/_id/files
