

import { Schema } from "mongoose";
import mongoose from "mongoose";

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    brand: { type: String },
    price: { type: Number, default: 0},
    oldPrice: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Categories', required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Subcategory', required: true },
    countInStock: { type: Number, default : 0, required: true },
    rating: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0, required: true },
    RAM: [{ type: String }],
    weight: [{ type: String }],
    size: [{ type: String }]
})

export default mongoose.model('Product', productSchema);