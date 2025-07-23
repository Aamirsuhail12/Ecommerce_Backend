
import {
      deletes, get, getAll, replace, update,
      Profile, CreateRecentlyViewed, getAllRecentlyViewed,
      AddToCart, getCart, UpdateCartProduct, deleteCartProduct,
      addWishList,
      getWishList,
      deleteWishList
} from '../controller/User.js';

import { Authentication } from '../controller/Auth.js';
import express from 'express';

const router = express.Router();

router.get('/profile', Authentication, Profile)
      .get('/recently-viewed', Authentication, getAllRecentlyViewed)
      .patch('/create/recently-viewed', Authentication, CreateRecentlyViewed)
      .patch('/cart/add', Authentication, AddToCart)
      .patch('/cart/:id', Authentication, UpdateCartProduct)
      .delete('/cart/:id', Authentication, deleteCartProduct)
      .patch('/wishlist/:id', Authentication, addWishList)
      .get('/wishlist', Authentication, getWishList)
      .delete('/wishlist/:id', Authentication, deleteWishList)
      .get('/cart', Authentication, getCart)
      .get('/:id', get)
      .get('/', getAll)
      .put('/:id', replace)
      .patch('/:id', update)
      .delete('/:id', deletes)


export default router;