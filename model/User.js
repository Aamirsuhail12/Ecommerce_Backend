
import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [50, "Name must be at most 50 characters long"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

        validate: {
            validator: function (v) {
                return /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[6-9]\d{9}$/.test(v); // Indian 10-digit mobile number format
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    recentlyviewedProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, min: 1, required: true },
        size: { type: String },
        weight: { type: String },
        RAM: { type: String }
    }],
    wishList : [{type: Schema.Types.ObjectId,ref : 'Product'}],
    isAdmin: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

export default mongoose.model('User', userSchema);