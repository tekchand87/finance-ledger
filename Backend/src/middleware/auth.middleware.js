import userModel from "../models/authentication/user.model.js";
import jwt from 'jsonwebtoken'
  
export  const  authMiddleware = async (req,res,next)=>{

  const token = req.cookies.refreshtoken || req.headers.authorization?.split(" ")[1]

  if(!token){
    return res.status(401).json({
      message : "Unauthorized acess, token is missing"
    })
  }

  try{

    const decoded = jwt.verify(token,process.env.JWT_SECRETS)

    console.log(decoded);// from here you can see the userId in the object of the decoded
    const user = await userModel.findById(decoded.userId);
    req.user = user;

    return next()
  }catch(error){
    return res.status(401).json({
      message : "UnAuthorized acess, token is invalid"
    })
  }
  


}
