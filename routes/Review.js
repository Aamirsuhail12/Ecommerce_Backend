
import express from 'express';
import { addReview, getReview } from '../controller/Review.js';
import { Authentication } from '../controller/Auth.js'
const rounter = express.Router();

rounter.post('/add', Authentication, addReview)
    .get('/:id', getReview);

export default rounter;