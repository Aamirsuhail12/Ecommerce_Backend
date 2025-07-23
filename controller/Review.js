
import Review from "../model/Review.js";
import User from "../model/User.js";

export const addReview = async (req, res) => {

    try {
        const { productId, review, rating } = req?.body;
        const email = req?.user?.email;

        const user  = await User.findOne({email});
        

        if (!productId || !user.name || !review || !rating) {
            return res.status(409).json({ success: false, msg: "Please fill all details" });
        }

        const reviewObj = new Review({
            productId: req.body.productId,
            userName: user.name,
            review: req.body.review,
            rating: req.body.rating
        })

        await reviewObj.save();
        return res.status(200).json({ success: true,review : reviewObj });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}

export const getReview = async (req, res) => {

    try {
        const {id} = req.params;
        if (!id) {
            return res.status(409).json({ success: false, msg: "Product id is required" });
        }

        const reviews = await Review.find({productId : id});

        return res.status(200).json({ success: true, reviews : reviews});
    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}