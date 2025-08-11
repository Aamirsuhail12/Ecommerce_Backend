

import mongoose, { Schema } from "mongoose"

const orderSchema = new Schema({
    name: {
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
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    country: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    town: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        size: {
            type: String
        },
        weight: {
            type: String
        },
        RAM: {
            type: String
        }
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalamount: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Order', orderSchema);