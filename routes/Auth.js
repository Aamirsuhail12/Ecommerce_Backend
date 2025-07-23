
import express from 'express';
import { Authentication, Logout, SignIn, SignUp } from '../controller/Auth.js';
const router = express.Router();

router.post('/signup',SignUp)
      .post('/signin',SignIn)
      .post('/logout',Authentication,Logout)

export default router;