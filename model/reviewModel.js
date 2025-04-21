const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'restaurant', 
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5, 
        },
        comment: {
            type: String,
            trim:true,
            default:""
        },
    },
    { timestamps: true }
);

const reviewModel = mongoose.model('review', reviewSchema);
module.exports = reviewModel;
