import { EventEmitter } from  "node:events";
import { sendEmail , emailSubject } from "../email/email.utils.js";
import { generateHTML as template } from "../email/generateHTML.js";


export const emailEvent = new EventEmitter()

emailEvent.on("confirmEmail" , async (data) => {
        await sendEmail(
            {to:data.to ,
                 subject:emailSubject.confirmEmail ,
                  html:template(data.firstName , data.otp)})
        .catch((error) =>{
            console.log("Error Sending confirm Email", error);
            
        })

})


emailEvent.on("forgetPassword" , async (data) => {
        await sendEmail(
            {to:data.to ,
                 subject:emailSubject.resetPassword ,
                  html:template(data.firstName , data.otp)})
        .catch((error) =>{
            console.log("Error Sending confirm Email", error);
            
        })

})



emailEvent.on("recoverAccount" , async (data) => {
        await sendEmail(
            {to:data.to ,
                 subject:emailSubject.recoverAccount ,
                  html:template(data.firstName , data.otp)})
        .catch((error) =>{
            console.log("Error while sending recover account email", error);
            
        })

})