import mongoose from 'mongoose'

const sessionSchema = mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "user",
    required : [true, "user is id required"]
  },
  refreshtoken : {
    type : String,
    required : [true,"refresh token is required"]
  },
  ip : {
    type : String,
    required : [true, "IP is required"]
  },
  userAgent : {
    type : String,
    required : [true,"userAgent is required"]
  },
  revoked : {
    type : Boolean ,
    default : false
  }
},{
  timestamps : true
})

const sessionModel = mongoose.model('session',sessionSchema)

export default sessionModel