import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username : {
    type : String,
    required : [true,"username is required"]
  },
  email : {
    type : String,
    required : [true,"Email is required"],
    unique : [true, "Email already exist"],
    trim : true,
    lowercase : true,
    match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/]
  },
  password : {
    type : String,
    required : [true,"password is required"],
    minlength :[6,"password length must be minmum length 6"],
    //select : false
  },
  verified : {
    type : String,
    default : false
  }
},{
  timestamps : true
})


userSchema.pre("save",async function(){
  if(!this.isModified("password")){
    return ;
  }

  const hash = await bcrypt.hash(this.password,10)

  this.password = hash;
  return 
})

userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password,this.password);
}

const userModel = mongoose.model('user',userSchema)

export default userModel