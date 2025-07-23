
import express from "express";
import { create, getAll, get, deletes, update } from '../controller/Products.js';

const router = express.Router();

router.post('/create', create)
    .get('/', getAll)
    .get('/:id', get)
    .delete('/:id', deletes)
    .put('/:id', update)

export default router;