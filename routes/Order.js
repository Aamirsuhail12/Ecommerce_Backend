
import { Router } from "express";
import { Authentication } from '../controller/Auth.js';
import { addOrder, getOrder, updateOrder } from "../controller/Order.js";

const router = Router();

router.post('/', Authentication, addOrder)
    .patch('/:id', Authentication, updateOrder)
    .get('/',Authentication, getOrder)

export default router;