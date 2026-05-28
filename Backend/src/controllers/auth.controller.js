import userModel from '../models/authentication/user.model.js'
import bcrypt from 'bcryptjs'
import {generateOtp,generateOtpHtml} from '../utils/utils.js'
import crypto from 'crypto'
import otpModel from '../models/authentication/otp.model.js'
import {sendEmail} from '../services/email.service.js'
import config from '../config/config.js'
import sessionModel from '../models/authentication/session.model.js'
import { ref } from 'process'
import jwt from 'jsonwebtoken'

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


  const newUser = await userModel.create({
    username : username,
    email : email,
    password : password
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
    email : email,
    otp : otphashed,
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

export const login = async (req,res)=>{
  const {email,password} = req.body

  const user = await userModel.findOne({
    email
  })
  if(!user){
    return res.status(401).json({
      message : "Invalid email or password"
    })
  }
  if(!user.verified){
    return res.status(403).json({
      message : "Please verify your email first"
    })
  }
  
  const isMatch = await user.comparePassword(password)

  if(!isMatch){
    console.log(isMatch)
    return res.status(401).json({
      message : "Invalid email or password p"
    })
  }

  const refreshtoken = jwt.sign({
    id : user._id
  },config.JWT_SECRET,{
    expiresIn : "7d"
  })

  const refreshtokenHashed = crypto.createHash("sha256").update(refreshtoken).digest('hex')

  const session = await sessionModel.create({
    user : user._id,
    refreshtoken : refreshtokenHashed,
    ip : req.ip,
    userAgent : req.headers['user-agent'] 
  })

  res.cookie("refreshtoken",refreshtoken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 7*24*60*60*1000 // 7days
  })

  const accesstoken = jwt.sign({
    id : user._id,
    sessionid : session._id
  },config.JWT_SECRET,{
    expiresIn : '15m'
  })

  return res.status(200).json({
    message : "loged in successfully ",
    user : {
      username : user.username,
      email : user.email
    },
    accesstoken
  })
}

export const refreshtoken = async (req,res)=>{

}

export const getMe = async (req,res)=>{
  const token = req.headers.authorization?.split(" ")[1]

  if(!token){
    return res.status(401).json({
      message : "token not found"
    })
  }

  const decoded = jwt.verify(token,config.JWT_SECRET)

  const user = await userModel.findById(decoded.id)

  res.status(200).json({
    message : "User fetched successfully",
    user : {
      username : user.username,
      email : user.email
    }
  })
}

export const logout = async (req,res)=>{
  const refreshtoken = req.cookies.refreshtoken

  if(!refreshtoken){
    return res.status(401).json({
      message : "refershtoken not found"
    })
  }

  const refreshtokenhashed = crypto.createHash("sha256").update(refreshtoken).digest("hex")

  const session = await sessionModel.findOne({
    refreshtoken: refreshtokenhashed,
    revoked : false
  })

  if(!session){
    return res.status(401).json({
      message : "Invalid refresht token"
    })
  }

  session.revoked=true
  await session.save()

  res.clearCookie("refreshtoken")

  res.status(200).json({
    message : "Logged out successfully"
  })
}

export const logoutAll = async (req,res)=>{
  const refreshtoken = req.cookies.refreshtoken
  if(!refreshtoken){
    return res.status(401).json({
      message : "refresh token not found"
    })
  }

  const decoded = jwt.verify(refreshtoken,config.JWT_SECRET)

  await sessionModel.updateMany({
    user : decoded.id,
    revoked : false
  },{
    revoked : true
  })

  res.clearCookie("refreshtoken");

  res.status(200).json({
    message : "Logged out from all devices successfully"
  })
} 