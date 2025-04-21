const mongoose =require ('mongoose')
const { Schema } = mongoose;


const menuSchema= new Schema({
    itemName:{
        type:String,
        required:true,
        unique:true,
        trim: true,
    },
    description:{
        type:String,
        required:true,
        trim: true,
    },
    price:{
        type:Number,
        required:true,
        min:1,
    },
    category:{
        type:String,
        required:true,
        trim: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",  // Reference to Restaurant model
        required: true
    },
    itemAvailability:{
        type:Boolean,
        default:true,
        required:true,
    },
    foodImage:{
        type:String,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwZgTsV5FSzcygnwaRW4SePUSXSiNZCdYUhw&s"
    }

},{timestamps:true})


const menuModel=mongoose.model('menu', menuSchema)
module.exports=menuModel