
import express from "express";
import { create, getAll, get, deletes, update, search } from '../controller/Products.js';
import { Authentication } from "../controller/Auth.js";

const router = express.Router();

router.post('/create',Authentication, create)
    .get('/search', search)
    .get('/:id', get)
    .get('/', getAll)
    .delete('/:id',Authentication, deletes)
    .put('/:id',Authentication, update)

export default router;