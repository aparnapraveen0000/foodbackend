const mongoose =require ('mongoose')
const { Schema } = mongoose;

const restaurantSchema= new Schema({
      name:{
        type:String,
        required:true,
        unique:true,
      },
      description:{
        type:String,
        required:true,
      },
      location:{
        address:{
            type:String,
            required:true,
        },
        city:{
            type:String,
            required:true,
            
        },
        state:{
            type:String,
            required:true,
        },
        pincode:{
            type:Number,
            required:true,
        }
      },
      rating:{
        type:Number,
        min:0,
        max:5,
        default:0
      },
      hotelImage:{
        type:String,
        default:"https://cdn-icons-png.flaticon.com/512/9425/9425755.png"
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'seller',
        required: true
      }
},
{timestamps:true}
)

const restaurantModel=mongoose.model('restaurant', restaurantSchema)
module.exports=restaurantModel
