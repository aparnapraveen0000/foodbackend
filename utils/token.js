var jwt = require('jsonwebtoken')
require('dotenv').config()
const generateToken=(id,role)=>{
 try{
    const token = jwt.sign({id,role },process.env.JWT_KEY )
    return token
 }
 catch(error){
  console.log(error)
 }

}
module.exports={generateToken}