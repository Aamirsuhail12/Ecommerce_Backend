
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
import AuthRouter from './routes/Auth.js';
import UserRouter from './routes/User.js'
import ReviewRouter from './routes/Review.js';
import OrderRouter from './routes/Order.js'

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from 'cookie-parser';
import fs from 'fs/promises'

const app = express();

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    next();
});

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
// app.use(cors()); //only for browser security.
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: (origin, callback) => {
        console.log('Origin received:', origin); // 📌 This prints every time browser requests
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true   // allow sending cookies
}));

app.use(express.json());
app.use(cookieParser());

//db connection 
main().catch((err) => {
    console.log('Database is not connect', err);
})
async function main() {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('DataBase connect successfully......');
}

// routes
// app.use('/access', express.static(path.join(__dirname, 'uploads')));
// ➡️ uploads folder (backend me h) ke andar ke files ko browser se directly access karne dena.
// http://localhost:5000/access/filename.jpg (frontend se request)


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

app.use('/auth', AuthRouter);
app.use('/users', UserRouter);
app.use('/categories', CategoriesRouter);
app.use('/products', ProductsRouter);
app.use('/subcategory', SubCategoryRouter);
app.use('/review', ReviewRouter);
app.use('/orders', OrderRouter);

app.post("/verify-token", async (req, res) => {
    const { token } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decodedToken;

        // Create JWT for backend session
        const backendToken = jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            success: true,
            user: { uid, email, name, picture },
            backendToken
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token", error: error.message });
    }
});

app.listen(process.env.PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${process.env.PORT}`);
})

// '0.0.0.0' -> server accept requests from any other devices.
// '127.0.0.1' -> server accept request from only same machine.

