import userModel from "../models/authentication/user.model";
import jwt from 'jsonwebtoken'

export function authMiddleware(req,res,next){

  const token = req.cookies.refreshtoken || req.headers.authorization?.split(" ")[1]

  if(!token){
    return res.status(401).json({
      message : "Unauthorized acess, token is missing"
    })
  }

  


}