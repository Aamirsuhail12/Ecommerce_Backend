


import Categories from "../model/Categories.js";
import Product from "../model/Products.js"
import cloudinary from 'cloudinary';
import Subcategory from '../model/SubCategory.js'

const buildFilter = async (filter) => {


   let fil = {};

   if (filter.category) {
      const cat = await Categories.findOne({ name: filter.category })

      fil.category = cat._id;
   }

   if (filter.subcategory) {
      const cat = await Subcategory.findOne({ subcategory: filter.subcategory })
      fil.subcategory = cat._id;
   }

   if (filter.price) {
      fil.price = {}
      if (filter.price[0] >= 0)
         fil.price.$gte = Number(filter.price[0])

      if (filter.price[1])
         fil.price.$lte = Number(filter.price[1])
   }


   if (filter.brand) {
      fil.brand = filter.brand;
   }

   if (filter._id) {
      fil._id = {}
      fil._id.$ne = filter._id
   }

   if (filter.isFeatured) {
      fil.isFeatured = true;
   }

   return fil;
}
export const getAll = async (req, res) => {

   try {
      let currentPage = Number(req.query.page) || 1;
      let filter = req.query.filter ? JSON.parse(decodeURIComponent(req.query.filter)) : {};

      filter = await buildFilter(filter);

      const totalElements = await Product.countDocuments(filter);
      const elementPerPage = currentPage === -1 ? totalElements : (Number(req.query.PerPage) || 4);
      const totalPage = Math.ceil(totalElements / elementPerPage);

      if (currentPage < 0)
         currentPage = 1;

      let products;
      if (Object.keys(filter).length > 0) {
         products = await Product.find(filter).populate('category').populate('subcategory').skip((currentPage - 1) * elementPerPage).limit(elementPerPage);

      }
      else
         products = await Product.find().populate('category').populate('subcategory').skip((currentPage - 1) * elementPerPage).limit(elementPerPage);

      return res.status(200).json({
         'products': products,
         'totalPage': totalPage
      });
   } catch (error) {
      return res.status(400).json({ msg: error.message })
   }

}

export const get = async (req, res) => {

   try {
      const id = req.params.id;
      const product = await Product.findById(id).populate('category').populate('subcategory');

      return res.status(200).json({ success: true, product });
   } catch (error) {
      return res.status(400).json({ msg: error.message });
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

      res.status(200).json(pro);
   } catch (error) {
      res.status(400).json(error);
   }
}
*/

export const create = async (req, res) => {

   const { email } = req.user;
   const user = await User.findOne({ email });

   if (user.isAdmin === false) {
      return res.status(400).json({ success: false, msg: 'Only admin can create product' });
   }
   try {
      const isvalidcategory = await Categories.findById(req.body.category);
      if (!isvalidcategory) {
         return res.status(404).json({ error: "Invalid category" });
      }

      const isvalidsubcategory = await Subcategory.findById(req.body.subcategory)

      if (!isvalidsubcategory) {
         return res.status(404).json({ error: 'Invalid Subcategory' })
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
         subcategory: req.body.subcategory,
         countInStock: req.body.countInStock,
         rating: req.body.rating,
         isFeatured: req.body.isFeatured,
         discount: req.body.discount,
         RAM: req.body.RAM,
         weight: req.body.weight,
         size: req.body.size
      });

      const savedProduct = await product.save();

      res.status(201).json({ message: 'Product created successfully', product: savedProduct });
   } catch (error) {
      console.error('Error in create product:', error);
      res.status(500).json({ error: 'Internal server error' });
   }
};


export const deletes = async (req, res) => {

      const {email} = req.user;
      const user = await User.findOne({email});
   
      if(user.isAdmin === false){
         console.log('isd');
         return res.status(400).json({success : false,msg : 'Only admin can delele product'});
      }
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

      const {email} = req.user;
      const user = await User.findOne({email});
   
      if(user.isAdmin === false){
         return res.status(400).json({success : false,msg : 'Only admin can edit product'});
      }
   try {
      const isvalidcategory = await Categories.findById(req.body.category);
      if (!isvalidcategory) {
         return res.status(404).json({ error: "invalid category" })
      }

      const isvalidsubcategory = await Subcategory.findById(req.body.subcategory)

      if (!isvalidsubcategory) {
         return res.status(404).json({ error: 'Invalid Subcategory' })
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
         oldPrice: req.body.oldPrice,
         category: req.body.category,
         subcategory: req.body.subcategory,
         countInStock: req.body.countInStock,
         rating: req.body.rating,
         numReviews: req.body.numReviews,
         isFeatured: req.body.isFeatured,
         discount: req.body.discount,
         RAM: req.body.RAM,
         weight: req.body.weight,
         size: req.body.size
      }

      const id = req.params.id;
      const pro = await Product.findByIdAndUpdate({ _id: id }, product, { new: true });
      res.status(200).json(pro);
   } catch (error) {
      res.status(400).json(error);
   }
}

export const search = async (req, res) => {

   const { q } = req.query;

   if (!q) {
      return res.status(400).json({ success: false, msg: "Query is required" });
   }
   try {
      const searchRegex = new RegExp(q, 'i');

      const categoryMatched = await Categories.findOne({ name: { $regex: searchRegex } });
      const subcategoryMatched = await Subcategory.findOne({ subcategory: { $regex: searchRegex } });

      const products = await Product.find({
         $or: [
            { name: { $regex: searchRegex } },
            { category: categoryMatched?._id },
            { subcategory: subcategoryMatched?._id },
            { brand: { $regex: searchRegex } }
         ]
      }).populate('category').populate('subcategory');

      return res.status(200).json({ success: true, products });
   } catch (error) {

      return res.status(500).json({ success: false, msg: error?.message });
   }
}