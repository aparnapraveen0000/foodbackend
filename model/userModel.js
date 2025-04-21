const mongoose=require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type:String,
     required:true,
    maxLength:30,
},
  email:{
    type: String,
    required:true,
    unique:true,
    maxLength:30,
    minLength:3,

},
  password:{
    type: String,
    required:true,
    minLength:8,

},

  mobile:{
    type:String,
    required:true,

},
 address:{
  
    type:String,
    required:true,
 },
 profilePic:{
    type:String,
    default:"https://cdn.vectorstock.com/i/1000v/26/40/profile-placeholder-image-gray-silhouette-vector-22122640.jpg"
 },
 isActive:{
    type:Boolean,
    default:true,
 },
 role: {
    type: String, 
    enum: ['user', 'admin'],
    default: 'user'
  }
  
  
  },
  { timestamps: true }
)
const userModel = mongoose.model('user', userSchema)
module.exports=userModel