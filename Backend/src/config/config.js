import dotenv from 'dotenv'

dotenv.config();

if(!process.env.MONGO_URI){
  throw new Error("MONGO_URI is not defined in this enviroment variables")
}
if(!process.env.EMAIL_USER){
  throw new Error("EMAIL_USER is not defined in this enviroment")
}

if(!process.env.EMAIL_PASS){
  throw new Error("EMAIL_PASS in not defined in this enviroment")
}

const config = {
  MONGO_URI : process.env.MONGO_URI,
  EMAIL_USER : process.env.EMAIL_USER,
  EMAIL_PASS : process.env.EMAIL_PASS
}
export default config;