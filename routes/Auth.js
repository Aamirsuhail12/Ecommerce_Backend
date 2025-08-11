
import express from 'express';
import { Authentication, Logout, SignIn, SignUp,SignInWithGoogle } from '../controller/Auth.js';
const router = express.Router();

router.post('/signup',SignUp)
      .post('/signin',SignIn)
      .post('/signinwithgoogle',SignInWithGoogle)
      .post('/logout',Authentication,Logout)

export default router;