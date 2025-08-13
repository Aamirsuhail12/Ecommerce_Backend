

import Categories from "../model/Categories.js"
import cloudinary from 'cloudinary';
import User from "../model/User.js";


export const getAll = async (req, res) => {


   try {
      let currentPage = Number(req.query.page) || 1;
      const totalElements = await Categories.countDocuments();
      const elementPerPage = currentPage === -1 ? totalElements : (Number(req.query.PerPage) || 4);
      const totalPage = Math.ceil(totalElements / elementPerPage);


      if (currentPage < 0)
         currentPage = 1;


      const categories = await Categories.find().skip((currentPage - 1) * elementPerPage).limit(elementPerPage);
      res.status(200).json(
         {
            'categories': categories,
            'totalPage': totalPage
         }
      );
   } catch (error) {
      res.status(400).json(error);
   }
}

export const get = async (req, res) => {

   try {
      const id = req.params.id;
      const category = await Categories.findById(id);
      res.status(200).json(category);
   } catch (error) {
      res.status(400).json({ error });
   }
}

export const create = async (req, res) => {

 
   try {
      const images = req.body.images;

      if (!Array.isArray(images)) {
         return res.status(400).json({ error: 'Images should be array' });
      }

      const uploadPromises = images.map((image) => {
         return cloudinary.v2.uploader.upload(image);
      })

      const uploadImages = await Promise.all(uploadPromises);

      const imgs = uploadImages.map((image) => {
         return image['url'];
      })

      const category = new Categories({
         name: req.body.name,
         images: imgs,
         color: req.body.color
      })

      const item = await category.save();

      res.status(200).json(item);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
}



export const deletes = async (req, res) => {

 
   try {
      const id = req.params.id;
      const category = await Categories.findByIdAndDelete(id);
      res.status(200).json({
         message: "Category delete successfully",
         category
      });
   } catch (error) {
      res.status(400).json({ error });
   }
}

export const update = async (req, res) => {

 
   try {
      const images = req.body.images;

      if (!Array.isArray(images)) {
         return res.status(400).json({ err: "Images should be array." })
      }

      const imagePromise = images.map((image) => {

         return cloudinary.v2.uploader.upload(image);
      })

      const imageUpload = await Promise.all(imagePromise);

      const imgs = imageUpload.map((image) => {
         return image['url'];
      })


      const id = req.params.id;

      const category = await Categories.findByIdAndUpdate({ _id: id }, {
         name: req.body.name,
         images: imgs,
         color: req.body.color
      }, { new: true });


      res.status(200).json({
         message: "Category update successfully",
         category
      });
   } catch (error) {
      res.status(400).json({ error });
   }
}


