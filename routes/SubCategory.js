
import express from "express";
import { create, getAll, get, deletes, update} from '../controller/SubCategory.js';

const router = express.Router();

router.get('/', getAll)
    .get('/:id', get)
    .post('/create', create)
    .delete('/:id', deletes)
    .put('/:id', update)

export default router;