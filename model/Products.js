

import { Schema } from "mongoose";
import mongoose from "mongoose";

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    brand: { type: String },
    price: { type: Number, default: 0 },
    oldPrice: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Categories', required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }

})

export default mongoose.model('Product', productSchema);