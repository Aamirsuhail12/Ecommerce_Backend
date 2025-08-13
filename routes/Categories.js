
import express from "express";
import { create, getAll, get, deletes, update} from '../controller/Categories.js';
import Authentication from '../controller/Auth.js'
const router = express.Router();

router.get('/', getAll)
    .get('/:id', get)
    .post('/create',Authentication, create)
    .delete('/:id',Authentication, deletes)
    .put('/:id',Authentication, update)

export default router;