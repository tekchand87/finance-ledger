import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import {generateOtp,generateOtpHtml} from '../utils/utils.js'
import crypto from 'crypto'
import otpModel from '../models/otp.model.js'
import {sendEmail} from '../services/email.service.js'

export const  register = async (req,res)=>{
  const {username,email,password} = req.body
  const isAlreadyRegistered = await userModel.findOne({
    $or:[
      {username},
      {email}
    ]
  })

  if(isAlreadyRegistered){
     return res.status(409).json({
      message : "By this Email or Username Already registered"
    })
  }

  const hashedPassword = await bcrypt.hash(password,10);

  const newUser = await userModel.create({
    username : username,
    email : email,
    password : hashedPassword
  })

  // generate otp and the send to the email 
  const otp = generateOtp()
  const hashedOtp = crypto.createHash("sha256").update(otp).digest('hex')

  await otpModel.create({
    email : email,
    user : newUser._id,
    otp : hashedOtp,
    expiresAt : Date.now()+10*60*1000 // active for only the 10m
  })
  
  const html = generateOtpHtml(otp)
  await sendEmail(email,"OTP verification",`otp is ${otp}`,html)


  res.status(201).json({
    message : "User is sucessfully registered",
    user : {
      name : newUser.username,
      email : newUser.email,
      verified : newUser.verified
    }
  })

}

export const emailVerify = async (req,res)=>{
  const {email,otp} = req.body 
  
  const otphashed = crypto.createHash("sha256").update(otp).digest("hex")
  const otpRecord = await otpModel.findOne({
    email,
    otphashed,
    expiresAt : {$gt : Date.now()}
  })

  if(!otpRecord){
    return res.status(404).json({
      message : "Invalid or expires OTP"
    })
  }

  const user = await userModel.findById(otpRecord.user)

  if(!user){
    return res.status(404).json({
      message : "user not found"
    })
  }
  user.verified = true
  await user.save()

  await otpModel.deleteMany({
    email
  })

  res.status(200).json({
    message : "Email verified successfully",
    user : {
      username : user.username,
      email : user.email,
      verified : user.verified
    }
  })
}