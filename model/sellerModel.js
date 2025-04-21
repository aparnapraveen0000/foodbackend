
const mongoose=require('mongoose')
const { Schema } = mongoose;

const sellerSchema = new Schema({
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

},password:{
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
 businessName:{
    type:String,
    required:true,
    maxLength:20,
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
        enum: ['seller', 'admin'],
        default: 'seller'
}
      
},
 { timestamps: true }
)
    const sellerModel = mongoose.model('seller', sellerSchema)
    module.exports=sellerModel