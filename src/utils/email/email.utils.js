import nodemailer from "nodemailer"
import { USER_EMAIL , USER_PASSWORD } from "../../../config/config.service.js";

export const sendEmail = async({
    to = "" , 
    subject = "" ,
    text = "" , 
    html = "" , 
    attachments = [],
    cc = "",
    bcc = ""}) =>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: USER_EMAIL,
            pass: USER_PASSWORD // app password
        }
    })

    try {
  const info = await transporter.sendMail({
    from: `"SarahaApp" <${USER_EMAIL}>`, // sender address
    to, // list of recipients
    subject, // subject line
    text, // plain text body
    html,
    attachments,
    cc,
    bcc
  });

  console.log("Message sent: %s", info.messageId);
    } catch (err) {
  console.error("Error while sending mail:", err);
    }

}

export const emailSubject = {
    confirmEmial: "Confirm Your Email",
    resetPassword : "Reset your Password",
    welcome: "Welcome to SarahaApp",
    contactUs: "Contact Us"

}