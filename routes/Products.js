
import express from "express";
import { create, getAll, get, deletes, update, search } from '../controller/Products.js';

const router = express.Router();

router.post('/create', create)
    .get('/search', search)
    .get('/:id', get)
    .get('/', getAll)
    .delete('/:id', deletes)
    .put('/:id', update)

export default router;