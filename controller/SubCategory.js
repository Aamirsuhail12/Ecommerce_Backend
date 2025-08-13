

import Categories from '../model/Categories.js';
import SubCategory from '../model/SubCategory.js';

export const getAll = async (req, res) => {
  try {
    // Get query params
    const category = req.query.category ? decodeURIComponent(req.query.category) : null;
    let currentPage = Number(req.query.page) || 1;

    let filtercategory = category || null;

    const totalElements = await SubCategory.countDocuments();
    const elementPerPage = currentPage === -1 ? totalElements : (Number(req.query.PerPage) || 4);
    const totalPage = Math.ceil(totalElements / elementPerPage);

    if (currentPage < 0) currentPage = 1;

    let subcategory = [];

    console.log("filter category:", filtercategory);

    if (!filtercategory) {
      if (currentPage === -1) {
        subcategory = await SubCategory.find().populate("category");
      } else {
        subcategory = await SubCategory.find()
          .populate("category")
          .skip((currentPage - 1) * elementPerPage)
          .limit(elementPerPage);
      }
    } else {
      const categoryDoc = await Categories.findOne({ name: filtercategory });
      if (!categoryDoc) {
        return res.status(404).json({ message: "Category not found" });
      }
      subcategory = await SubCategory.find({ category: categoryDoc._id }).populate("category");
    }

    res.status(200).json({
      subcategory,
      totalPage,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};


export const get = async (req, res) => {

   try {
      const id = req.params.id;
      const subcategory = await SubCategory.findById(id).populate('category');
      res.status(200).json(subcategory);
   } catch (error) {
      res.status(400).json({ error });
   }
}

export const create = async (req, res) => {

    
   try {

      const subcategory = new SubCategory({
         category: req.body.category,
         subcategory: req.body.subcategory
      })

      const item = await subcategory.save();

      res.status(200).json(item);
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
}



export const deletes = async (req, res) => {

     
   try {
      const id = req.params.id;
      const subcategory = await SubCategory.findByIdAndDelete(id);
      res.status(200).json({
         message: "Sub Category delete successfully",
         subcategory
      });
   } catch (error) {
      res.status(400).json({ error });
   }
}

export const update = async (req, res) => {

   
   try {


      const id = req.params.id;

      const subcategory = await SubCategory.findByIdAndUpdate({ _id: id }, {
         category: req.body.category,
         subcategory: req.body.subcategory
      }, { new: true });


      res.status(200).json({
         message: "Sub Category update successfully",
         subcategory
      });
   } catch (error) {
      res.status(400).json({ error });
   }
}


