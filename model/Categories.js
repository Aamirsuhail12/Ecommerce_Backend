
import mongoose from "mongoose";


const categoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    images: [
        {
            type: String,
            required : true
        }
    ],
    color: {
        type: String,
        required : true
    }
})

export default mongoose.model('Categories', categoriesSchema);