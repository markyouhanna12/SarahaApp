import bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import {SALT} from "../../../config/config.service.js"
import {HashEnum} from "../enums/security.enum.js"



export const genrateHash = async ({ plaintext, salt = SALT, algorithm = HashEnum.Bcrypt }) =>{

        let hashResults = ""

        switch(algorithm){
            case HashEnum.Bcrypt:
                hashResults = await bcrypt.hash(plaintext,salt)
                break;

        
            case HashEnum.Argon:
            hashResults = await argon2.hash(plaintext)
            break;
        
        default:

            hashResults = await bcrypt.hash(plaintext,salt)
            break
        }

        return hashResults;
}



export const compareHash = async ({ plaintext, ciphertext, algorithm = HashEnum.Bcrypt }) =>{

        let match = false

        switch(algorithm){
            case HashEnum.Bcrypt:
                match = await bcrypt.compare(plaintext,ciphertext)
                break;

        
            case HashEnum.Argon:
                match = await argon2.verify(ciphertext,plaintext)
                break;
        
        default:
            match = await bcrypt.compare(plaintext,ciphertext)
            break
        }

        return match;
}