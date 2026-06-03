import crypto from "node:crypto"
import { ENCRYPTION_SECRET } from "../../../config/config.service.js";


const IV_LENGTH = 16; // 16 bit
const ENCRYPTION_SECRET_KEY = ENCRYPTION_SECRET // must be 32 byte
// symmetric encryption 
// secret key

export const encrypt = async (text) =>{

    const iv = crypto.randomBytes(IV_LENGTH)
    console.log({iv});

    const cipher = crypto.createCipheriv("aes-256-cbc",ENCRYPTION_SECRET_KEY,iv)

    console.log({cipher});
    
    let encryptedData = cipher.update(text,"utf-8","hex")
    
    encryptedData += cipher.final("hex")

    console.log({encryptedData});

    return `${iv.toString("hex")}:${encryptedData}`

}


export const decrypt = async (encryptedData) =>{

    const [ iv , encryptedText] = encryptedData.split(":")
    const binaryLike = Buffer.from(iv,"hex")

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        ENCRYPTION_SECRET_KEY,
        binaryLike)

    let decryptedData = decipher.update(encryptedText,"hex","utf-8")

    decryptedData += decipher.final("utf-8")

    return decryptedData;


}