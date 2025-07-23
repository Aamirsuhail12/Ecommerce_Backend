
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const reviewSchema = new Schema({

    productId: {
        type: String,
        required: [true, "Product id is required"]
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    review: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 1,
        required: true
    },
    date : {
        type : Date,
        default : Date.now,
    }

});
// }, { timestamps: true });

export default mongoose.model('Review', reviewSchema);