
import Order from "../model/Order.js";
import User from '../model/User.js';

export const addOrder = async (req, res) => {

    const { email } = req.user;
    const user = await User.findOne({ email });
    
    if (!req?.body?.name || !req?.body?.phone || !req?.body?.email || !req?.body?.country ||
        !req?.body?.landmark || !req?.body?.street || !req?.body?.town || !req?.body?.state ||
        !req?.body?.pincode || !req?.body?.products || !req?.body?.totalamount || !req?.body?.orderStatus) {
        return res.status(400).json({ success: false, msg: 'Please fill details' });
    }

    try {
        const odr = new Order({
            name: req?.body?.name,
            phone: req?.body?.phone,
            email: req?.body?.email,
            country: req?.body?.country,
            landmark: req?.body?.landmark,
            street: req?.body?.street,
            town: req?.body?.town,
            state: req?.body?.state,
            pincode: req?.body?.pincode,
            products: req?.body?.products,
            user: user._id,
            totalamount: req?.body?.totalamount,
            orderStatus: req?.body?.orderStatus
        })

        user.cart = [];
        await odr.save()
        await user.save();

        const order = await Order.findById(odr._id).populate({
            path: 'products',
            populate: { path: 'product' }
        })

        return res.status(200).json({ success: true, order })

    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message })
    }
}

export const updateOrder = async (req, res) => {

    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, msg: 'Order id is required' });
    }

    if (!req?.body?.orderStatus) {
        return res.status(400).json({ success: false, msg: 'Order status is required' });
    }

    try {
        const order = await Order.findOneAndUpdate({ _id: id }, { orderStatus: req?.body?.orderStatus }, {
            new: true,              // return updated document
            runValidators: true     // ✅ this enables enum and other schema validations

        });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message })
    }
}

export const getOrder = async (req, res) => {

    const { all } = req.query || 'true';
    const { email } = req.user;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, msg: "User Not Found" });
    }
    try {

        let orders = [];
        if (all === 'false') {
            orders = await Order.find({ user: user._id }).populate({
                path: 'products',
                populate: { path: 'product' }
            });
        }
        else {
            orders = await Order.find().populate({
                path: 'products',
                populate: { path: 'product' }
            });
        }
        return res.status(200).json({ success: true, orders });

    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message })
    }
}
