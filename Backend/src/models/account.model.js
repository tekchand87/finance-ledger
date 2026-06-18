import mongoose, { mongo } from 'mongoose'

const accountShema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "user",
    required : [true,"Account must be associated with the user"],
    index : true
  },
  status : {
    type : String,
    enum : {
      values : ["ACTIVE","FROZEN","CLOSED"],
      message : "Status can be either ACTIVE , FROZEN OR CLOSED"
    },
    default : "ACTIVE"
  },
  currency : {
    type : String,
    required : [true,"Currency is required for creating an account"],
    default : "INR"
  },
},{
  timestamps : true
})

const accountModel = mongoose.model("account",accountShema)

export default accountModel