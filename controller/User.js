

import User from '../model/User.js';
import Products from '../model/Products.js';
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer";
import { rmSync } from 'fs';

export const getAll = async (req, res) => {
    try {
        const users = await User.find();

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        return res.status(500).json({ success: false, msg: error.message });
    }
};

export const get = async (req, res) => {

    try {

        const id = req.params.id;

        const user = await User.findById({ _id: id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ success: true, user })

    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error.message });
    }
}

export const replace = async (req, res) => {

    try {
        const _id = req.params.id;
        const data = { ...req.body };

        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(data.password, salt);
            data.password = hashPassword;
        }

        const result = await User.replaceOne({ _id }, data, {
            overwrite: true, // ✅ fixed here
        })

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' })
        }

        const user_ = await User.findOne({ _id });
        const { password: pwd, ...userWithoutPassword } = user_._doc;

        return res.status(200).json({ success: true, user: userWithoutPassword })

    } catch (error) {
        
        return res.status(500).json({ success: false, error: error.message })
    }
}

export const update = async (req, res) => {

    try {
        const _id = req.params.id;
        const data = { ...req.body };

        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(data.password, salt);
            data.password = hashPassword
        }
        const user = await User.findByIdAndUpdate(_id, { $set: data }, { new: true })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        return res.status(200).json({ success: true, user })

    } catch (error) {

        return res.status(500).json({ success: false, error: error.message })
    }
}

export const deletes = async (req, res) => {

    try {
        const _id = req.params.id;
        const user = await User.findByIdAndDelete(_id)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        return res.status(200).json({ success: true, message: 'User delete successfully...', user })

    } catch (error) {

        return res.status(500).json({ success: false, error: error.message })
    }
}

export const Profile = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await User.findOne({ email }).populate('cart.product').populate('recentlyviewedProducts');

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User Not Found', isLogin: false });
        }

        const { password: pwd, ...userWithoutPassword } = user._doc;
        return res.status(200).json({ success: true, user: userWithoutPassword, isLogin: true });
    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error.message, isLogin: false });
    }
}

export const editProfile = async (req, res) => {

    try {
        const { email } = req.user;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User Not Found'
            })
        }

        if (req?.body?.name === '') {
            return res.status(500).json({ success: false, msg: 'Name is required' })
        }

        if (req?.body?.phone === '') {
            return res.status(500).json({ success: false, msg: 'Phone is required' })
        }

        try {
            let payload = {
                name: req?.body?.name,
                phone: req?.body?.phone
            }
            if (req?.body?.image) {
                payload = { ...payload, image: req?.body?.image }
            }
            await User.findByIdAndUpdate(user?._id, payload, { new: true });
            return res.status(200).json({ success: true });
        } catch (error) {

            return res.status(500).json({ success: false, msg: error?.message })
        }

    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message })
    }

}

export const changePassword = async (req, res) => {

    try {
        const { email } = req.user;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }

        const ismatched = await bcrypt.compare(req.body.password, user.password);

        if (!ismatched) {
            return res.status(400).json({ success: false, msg: 'Wrong password' });
        }

        const hashPassword = await bcrypt.hash(req.body.newpassword, 10);

        await User.findByIdAndUpdate(user._id, { password: hashPassword });

        return res.status(200).json({ success: true });


    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}

export const CreateRecentlyViewed = async (req, res) => {

    try {
        const productId = req?.body?.id;
        const { email } = req?.user;

        if (!productId) {
            return res.status(400).json({ success: false, msg: 'Product ID is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }

        user.recentlyviewedProducts = user?.recentlyviewedProducts?.filter(id => id.toString() !== productId)

        user?.recentlyviewedProducts?.unshift(productId);

        if (user?.recentlyviewedProducts?.length > 5) {
            user.recentlyviewedProducts = user?.recentlyviewedProducts?.slice(0, 5)
        }

        // await user.save({ validateBeforeSave: true, optimisticConcurrency: false })
        await User.findByIdAndUpdate(user._id, { recentlyviewedProducts: user.recentlyviewedProducts }, { new: true });

        return res.status(200).json({ success: true, msg: 'RecentlyviewedProduct added successfully!' })

    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error.message })
    }
}

export const getAllRecentlyViewed = async (req, res) => {
    try {

        const { email } = req.user;

        // const user = await User.findOne({ email }).populate('recentlyviewedProducts')
        const user = await User.findOne({ email }).populate({
            path: 'recentlyviewedProducts',
            populate: [
                { path: 'category' },
                { path: 'subcategory' }
            ],
        })

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User Not found' });
        }

        return res.status(200).json({ success: true, recentlyviewedProducts: user.recentlyviewedProducts });

    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error.message })
    }
}

export const AddToCart = async (req, res) => {

    try {
        const { email } = req?.user;
        const { product, quantity } = req?.body;

        if (!product) {
            return res.status(404).json({ success: false, msg: 'ProductId is required' });
        }

        if (!quantity || quantity < 1) {
            return res.status(404).json({ success: false, msg: 'Quantity is required & must be atleast one' });
        }

        const user = await User.findOne({ email }).populate('cart.product');

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }

        user.cart = user?.cart?.filter(p => p?.product?.toString() !== req?.body?.product)

        user?.cart?.push(req?.body)

        const updateduser = await User.findByIdAndUpdate(user._id, { cart: user.cart }, { new: true }).populate('cart.product');
        return res.status(200).json({ success: true, msg: 'Product added to cart successfully!', cart: updateduser?.cart })

    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error?.message })
    }
}

export const getCart = async (req, res) => {
    try {

        const { email } = req.user;
        const user = await User.findOne({ email }).populate('cart.product')

        if (!user) {
            return res.status(500).json({ success: false, msg: 'User Not Found' });
        }

        return res.status(200).json({ success: true, cart: user.cart })

    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error.message })
    }
}

export const UpdateCartProduct = async (req, res) => {
    try {
        const { email } = req.user;
        const user = await User.findOne({ email });
        const quant = req?.body?.quantity;
        const id = req?.params?.id;

        if (!user) {
            return res.status(409).json({ success: false, msg: 'User Not found' });
        }

        if (!id) {
            return res.status(409).json({ success: false, msg: 'ID is required' });
        }

        if (!quant) {
            return res.status(409).json({ success: false, msg: 'quantity is required' });
        }

        const idx = user?.cart?.findIndex((p) => p._id.toString() === id);

        if (idx === -1) {
            return res.status(409).json({ success: false, msg: 'Product Not Found' });
        }

        const ele = user?.cart?.[idx];

        user.cart[idx] = {
            _id: ele?._id,
            product: ele?.product,
            quantity: quant,
            size: ele?.size,
            weight: ele?.weight,
            RAM: ele?.RAM
        }

        await user.save();

        return res.status(200).json({ success: true, msg: 'Quantity update successfully!' })
    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error.message })
    }
}

export const deleteCartProduct = async (req, res) => {
    try {

        const { email } = req?.user;
        const id = req?.params?.id;
        const user = await User.findOne({ email }).populate('cart.product');

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User Not Found' });
        }

        if (!id) {
            return res.status(400).json({ success: false, msg: 'Product id is required' });
        }

        user.cart = user?.cart?.filter((p) => p._id.toString() !== id)

        await user.save();
        return res.status(200).json({ success: true, msg: 'Product delete from cart successfully!', cart: user?.cart })
    } catch (error) {
        
        return res.status(500).json({ success: false, msg: error.message })
    }
}

export const addWishList = async (req, res) => {

    const { id } = req.params;
    const { email } = req?.user;
    const user = await User.findOne({ email });
    if (!id) {
        return res.status(400).json({ success: false, msg: 'Id is required' });
    }

    if (!user) {
        return res.status(400).json({ success: false, msg: "User is not Found" });
    }
    try {
        if (user?.wishList?.includes(id)) {
            return res.status(409).json({ success: false, msg: 'product already added to wishList' });
        }
        user?.wishList?.push(id);
        await user.save();

        const product = await Products.findById(id).populate('category subcategory');
        return res.status(200).json({ success: true, product });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}

export const getWishList = async (req, res) => {

    const { email } = req?.user;
    const user = await User.findOne({ email }).populate({
        path: 'wishList',
        populate: [
            { path: 'category' },
            { path: 'subcategory' }
        ]
    });


    if (!user) {
        return res.status(400).json({ success: false, msg: "User is not Found" });
    }
    try {
        const products = user?.wishList;
        return res.status(200).json({ success: true, products });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}

export const deleteWishList = async (req, res) => {

    const { id } = req.params;
    const { email } = req?.user;
    const user = await User.findOne({ email });
    if (!id) {
        return res.status(400).json({ success: false, msg: 'Id is required' });
    }

    if (!user) {
        return res.status(400).json({ success: false, msg: "User is not Found" });
    }
    try {
        user.wishList = user?.wishList?.filter((proid) => proid.toString() !== id);
        await user.save();
        return res.status(200).json({ success: true, id });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}

export const SendorReSendOtp = async (req, res) => {
    const toEmail = req.body.email;

    if (!toEmail) {
        return res.status(400).json({ success: false, msg: "Email is required" });
    }

    const user = await User.findOne({ email: toEmail });

    if (!user) {
        return res.status(400).json({ success: false, msg: "User Not Found" });
    }

    const otp_ = Math.floor(100000 + Math.random() * 900000).toString();
    const date = Date.now();

    try {
        await User.findByIdAndUpdate(user._id, {
            otp: otp_,
            isotpExpire: date + 2 * 60 * 1000, // expire in 2 minutes
            otpcreateAt: date
        }, { new: true });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GOOGLE_GMAIL,
                pass: process.env.GOOGLE_APP_PASS
            }
        });

        const mailOptions = {
            from: `"My Ecommerce App" <${process.env.GOOGLE_GMAIL}>`,
            to: toEmail,
            subject: "Your OTP Code",
            html: `<p>Your OTP is: <b>${otp_}</b></p><p>This will expire in 2 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);

        
        return res.status(200).json({ success: true, msg: "OTP sent successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
};

export const verifyOTP = async (req, res) => {

    const email = req.body?.email;
    const otp = req.body?.otp;

    if (!email) {
        return res.status(400).json({ success: false, msg: 'Email is required' });
    }

    if (!otp) {
        return res.status(400).json({ success: false, msg: 'OTP is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ success: false, msg: 'User Not Found' });
    }
    try {
        if (otp !== user?.otp) {
            return res.status(400).json({ success: false, msg: 'Invalid OTP' });
        }

        if (Date.now() > user.isotpExpire) {
            return res.status(400).json({ success: false, msg: 'OTP expired, click on resend OTP' });
        }


        await User.findByIdAndUpdate(user._id, {
            otp: null,
            isotpExpire: null,
            otpcreateAt: null
        })
        return res.status(200).json({ success: true, msg: 'OTP verified successfully!' })
    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}

export const ResetPassword = async (req, res) => {

    const email = req?.body?.email;
    const password = req?.body?.password;

    if (!email) {
        return res.status(400).json({ success: false, msg: 'Email is requied' });
    }

    if (!password) {
        return res.status(400).json({ success: false, msg: 'Password is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ success: false, msg: 'User Not Found' });
    }

    try {

        const hashPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(user._id, { password: hashPassword }, { new: true });

        return res.status(200).json({ success: true, msg: 'reset password successfully!' })

    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}
