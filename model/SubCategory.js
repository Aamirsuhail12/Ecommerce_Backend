
import mongoose from "mongoose";
import { Schema } from "mongoose";

const subCategorySchema = new mongoose.Schema({
    category: {
        type: Schema.Types.ObjectId, ref: 'Categories',
        required: true
    },
    subcategory:
    {
        type: String,
        required: true
    }
})

export default mongoose.model('Subcategory', subCategorySchema);