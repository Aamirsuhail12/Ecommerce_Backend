
import {
      deletes, get, getAll, replace, update,
      Profile, CreateRecentlyViewed, getAllRecentlyViewed,
      AddToCart, getCart, UpdateCartProduct, deleteCartProduct,
      addWishList,
      getWishList,
      deleteWishList,
      editProfile,
      changePassword,
      verifyOTP,
      SendorReSendOtp,
      ResetPassword
} from '../controller/User.js';

import { Authentication } from '../controller/Auth.js';
import express from 'express';

const router = express.Router();

router.get('/profile', Authentication, Profile)
      .get('/recently-viewed', Authentication, getAllRecentlyViewed)
      .get('/wishlist', Authentication, getWishList)
      .get('/cart', Authentication, getCart)
      .get('/:id', get)
      .get('/', getAll)
      .patch('/create/recently-viewed', Authentication, CreateRecentlyViewed)
      .patch('/cart/add', Authentication, AddToCart)
      .patch('/cart/:id', Authentication, UpdateCartProduct)
      .delete('/cart/:id', Authentication, deleteCartProduct)
      .patch('/wishlist/:id', Authentication, addWishList)
      .patch('/edit-profile', Authentication, editProfile)
      .patch('/change-password', Authentication, changePassword)
      .patch('/send-otp',  SendorReSendOtp)
      .patch('/verify-otp',verifyOTP)
      .patch('/reset-password',ResetPassword)
      .patch('/:id', update)
      .put('/:id', replace)
      .delete('/wishlist/:id', Authentication, deleteWishList)
      .delete('/:id', deletes)


export default router;