import nodemailer from 'nodemailer';
import config from '../config/config.js'

const transproter = nodemailer.createTransport({
  service : "gmail",
  auth :{
    user : config.EMAIL_USER,
    pass : config.EMAIL_PASS
  }
})

transproter.verify((error,success) =>{
  if(error){
    console.log("Error configure email transporter : ",error)
  }
  else{
    console.log("Email transporter to send Emails")
  }
})

// Function to send Email
export const sendEmail = async (to,subject,text,html) =>{
  try{
    const info = await transproter.sendMail({
      from : `Tekchand Backend <${config.EMAIL_USER}`,
      to : to,
      subject: subject,
      text : text ,
      html : html
    })
  }catch(error){
    console.log("Error sending Emails : ",error)
  }
}
