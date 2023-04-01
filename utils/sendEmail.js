import { createTransport } from "nodemailer";
export const sendMail=async(to,subject,text)=>{
const transporter=createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_HOST,
  auth: {
    user:process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
    })
    await transporter.sendMail({
        to,subject,text
    })
}