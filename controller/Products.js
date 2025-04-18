

import Categories from "../model/Categories.js";
import Product from "../model/Products.js"
import cloudinary from 'cloudinary';


export const getAll = async (req, res) => {

   try {
      let currentPage = Number(req.query.page) || 1;
      const totalElements = await Product.countDocuments();
      const elementPerPage = currentPage === -1 ? totalElements : (Number(req.query.PerPage) || 4);
      const totalPage = Math.ceil(totalElements / elementPerPage);

      console.log(req.query, currentPage, totalElements, elementPerPage, totalPage)
      if (currentPage < 0)
         currentPage = 1;

      const products = await Product.find().populate('category').skip((currentPage - 1) * elementPerPage).limit(elementPerPage);
      res.status(200).json({
         'products': products,
         'totalPage': totalPage
      });
   } catch (error) {
      res.status(400).json({ message: 'error', error })
   }

}

export const get = async (req, res) => {

   try {
      const id = req.params.id;
      const product = await Product.findById(id).populate('category');
      res.status(200).json(product);
   } catch (error) {
      res.status(400).json({ error });
   }
}

/*
export const create = async (req, res) => {

   try {
      console.log('backend body here : ',req.body);
      const isvalidcategory = await Categories.findById(req.body.category);
      if (!isvalidcategory) {
         return res.status(404).json({ error: "invalid category" })
      }

      const images = req.body.images;
      console.log('req.files',images)

      if (!Array.isArray(images)) {
         return res.status(400).json({ error: 'Images should be array' });
      }

      console.log('images', images)
      const uploadPromises = images.map((image) => {
         return cloudinary.v2.uploader.upload(image);
      })

      const uploadImages = await Promise.all(uploadPromises);

      const imgs = uploadImages.map((image) => {
         return image['url'];
      })


      req.body.images.forEach((file) => {
         console.log('path of file:', file.path);
         fs.unlink(file.path, (err) => {
            if (err) {
               console.error('Error deleting file:', file.path, err);
            }
         });
      });



      const product = new Product({
         name: req.body.name,
         description: req.body.description,
         images: imgs,
         brand: req.body.brand,
         price: req.body.price,
         oldPrice: req.body.oldPrice,
         category: req.body.category,
         countInStock: req.body.countInStock,
         rating: req.body.rating,
         isFeatured: req.body.isFeatured
      })

      const pro = await product.save();
      console.log('product', pro);

      res.status(200).json(pro);
   } catch (error) {
      res.status(400).json(error);
   }
}
*/

export const create = async (req, res) => {
   try {
      const isvalidcategory = await Categories.findById(req.body.category);
      if (!isvalidcategory) {
         return res.status(404).json({ error: "Invalid category" });
      }

      if (!req.body.images || req.body.images.length === 0) {
         return res.status(400).json({ error: 'No images provided' });
      }

      const product = new Product({
         name: req.body.name,
         description: req.body.description,
         images: req.body.images,
         brand: req.body.brand,
         price: req.body.price,
         oldPrice: req.body.oldPrice,
         category: req.body.category,
         countInStock: req.body.countInStock,
         rating: req.body.rating,
         isFeatured: req.body.isFeatured
      });

      const savedProduct = await product.save();

      res.status(201).json({ message: 'Product created successfully', product: savedProduct });
   } catch (error) {
      console.error('Error in create product:', error);
      res.status(500).json({ error: 'Internal server error' });
   }
};


export const deletes = async (req, res) => {

   try {
      const id = req.params.id;
      const product = await Product.findByIdAndDelete(id);
      res.status(200).json({
         message: 'Deletion sucessfully',
         product
      })
   } catch (error) {
      res.status(400).json({ error })
   }
}

export const update = async (req, res) => {

   try {
      const isvalidcategory = await Categories.findById(req.body.category);
      if (!isvalidcategory) {
         return res.status(404).json({ error: "invalid category" })
      }

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

      const product = {
         name: req.body.name,
         description: req.body.description,
         images: imgs,
         brand: req.body.brand,
         price: req.body.price,
         category: req.body.category,
         countInStock: req.body.countInStock,
         rating: req.body.rating,
         numReviews: req.body.numReviews,
         isFeatured: req.body.isFeatured
      }

      const id = req.params.id;
      const pro = await Product.findByIdAndUpdate({ _id: id }, product, { new: true });
      res.status(200).json(pro);
   } catch (error) {
      res.status(400).json(error);
   }
}


