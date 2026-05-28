import mongoose from 'mongoose'

const otpSchema = mongoose.Schema({
  email : {
    type : String,
    required : [true,"Email is required"],
  },
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "user",
    required : [true,'user is required']
  },
  otp :{
    type : String,
    required : [true,"otp is required"]
  },
  expiresAt : {
    type : Date,
    required : true
  }
},{
  timestamps : true
})

const otpModel = mongoose.model('otp',otpSchema);

export default otpModel;