
import User from "../model/User.js"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import admin from "../firebaseAdmin.js";

export const SignUp = async (req, res) => {

    const { name, email, password, phone, isAdmin } = req.body;
    try {

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ msg: 'Please fill all details' });
        }
        const isUserExit = await User.findOne({ email });


        if (isUserExit) {
            return res.status(409).json({ msg: 'User already exist' });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashpassword,
            phone,
            isAdmin
        })

        // console.log('user : ',user);

        await user.save();

        const { password: pwd, ...userWithoutPassword } = user._doc;

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            httpOnly: true,         // Cannot be accessed by frontend JavaScript
            secure: false,           // Only over HTTPS (set to false for development)
            sameSite: 'Strict',     // Prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            // maxAge: 1 * 60 * 1000 // 1 minutes
        })

        return res.status(201).json({ msg: 'Register Successful!' })

    } catch (error) {
        console.error("User creation error:", error); // Log the real error

        return res.status(500).json({ msg: error });
    }

}

export const SignIn = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(409).json({ msg: 'Please fill all details' });
        }

        const user = await User.findOne({ email });


        if (!user) {
            return res.status(404).json({ msg: 'Please Create Account User not found' });
        }

        if (!user?.password) {
            return res.status(404).json({ msg: 'Please continue with google or set password' });

        }

        // console.log('user in signin',user);

        const isSame = await bcrypt.compare(password, user.password);
        if (!isSame) {
            return res.status(401).json({ msg: 'invalid credentials' })
        }

        const token = await jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // const { password: pwd, ...userWithoutPassword } = user._doc

        res.cookie("token", token, {
            httpOnly: true,         // Cannot be accessed by frontend JavaScript
            secure: false,           // Only over HTTPS (set to false for development)
            sameSite: 'Strict',     // Prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return res.status(200).json({ msg: 'Login Successful!' })
    } catch (error) {
        console.log('error in singin', error);
        return res.status(500).json({ msg: error.message });
    }
}

export const SignInWithGoogle = async (req, res) => {


    try {

        // 1. Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(req.body.token);

        const { name, picture, email } = decodedToken;

        const user = await User.findOne({ email });
        let token = null
        if (!user) {

            const u = new User({
                name,
                email,
                password: null,
                image: picture
            })
            await u.save();
            token = await jwt.sign({ id: u._id, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        } else {

            token = await jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        }

        res.cookie("token", token, {
            httpOnly: true,         // Cannot be accessed by frontend JavaScript
            secure: false,           // Only over HTTPS (set to false for development)
            sameSite: 'Strict',     // Prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            // maxAge: 1 * 60 * 1000 // 1 minutes
        })

        return res.status(200).json({ success: true, msg: 'Login successfull' })

    } catch (error) {
        return res.status(500).json({ success: false, msg: error?.message });
    }
}

export const Logout = async (req, res) => {

    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false, // Set true if using HTTPS
            sameSite: 'Strict' // Or 'Strict'/'Lax' based on setup
        })

        return res.status(200).json({ success: true, msg: 'logout successful!' })
    } catch (error) {
        console.log('Error in logout!', error);
        return res.status(500).json({ success: false, msg: error.msg })
    }
}


//auth middleware....

export const Authentication = async (req, res, next) => {

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ msg: 'No token. unauthorized', isLogin: false })
    }
    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Invalid or Expire Token', isLogin: false });
    }
}