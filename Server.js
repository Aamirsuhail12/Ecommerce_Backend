
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';
import CategoriesRouter from './routes/Categories.js';
import ProductsRouter from './routes/Products.js';
import SubCategoryRouter from './routes/SubCategory.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import fs from 'fs/promises'

const app = express();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, // Replace with your Cloudinary cloud name
    api_key: process.env.API_KEY, // Replace with your Cloudinary API key
    api_secret: process.env.API_SECRET, // Replace with your Cloudinary API secret
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

//middleware
const upload = multer({ storage });


//middlewares
app.use(cors());
app.use(express.json());

//db connection 
main().catch((err) => {
    console.log('Database is not connect', err);
})
async function main() {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('DataBase connect successfully......');
}

// routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
/*
app.use('/uploads', upload.array('images'), (req, res) => {

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // console.log('Uploaded Files:', req.files); // ✅ Debugging
        const fileUrls = req.files.map(file => `uploads/${file.filename}`);
        console.log('fileurl',fileUrls)
        res.status(200).json({ message: 'Images uploaded successfully', files: fileUrls });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading files' });
    }
});
*/

app.use('/uploads', upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        // Upload to Cloudinary
        const uploaded = await Promise.all(
            req.files.map(file => cloudinary.v2.uploader.upload(file.path))
        );

        const imageUrls = uploaded.map(file => file.secure_url);

        // Delete local files
        await Promise.all(
            req.files.map(file => fs.unlink(file.path))
        );

        console.log('urls', imageUrls)

        res.json({ message: 'Files uploaded', urls: imageUrls });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


app.get('/coutrylist', async (req, res) => {

    try {
        const response = await axios.get('https://api.first.org/data/v1/countries');
        res.json(response.data);
    } catch (error) {
        console.log("this is error", error.message);
        res.json(error.message);
    }
})


app.use('/categories', CategoriesRouter);
app.use('/products', ProductsRouter);
app.use('/subcategory', SubCategoryRouter);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})