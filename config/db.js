const mongoose = require('mongoose')
require('dotenv').config()
const DB_CONNECTION_LINK=process.env.DB_CONNECTION_LINK

const connectDB=async()=>{
    try{
     const response= await mongoose.connect(DB_CONNECTION_LINK)
     console.log("db is connected")
    }
    catch(error){
        console.log("db is not connected")
        console.log(error)

    }
}
module.exports={connectDB}