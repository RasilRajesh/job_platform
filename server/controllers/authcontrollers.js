const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const registeruser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all the fields"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existinguser = await User.findOne({ email: email.toLowerCase() });

        if (existinguser) {
            return res.status(400).json({
                message: "An account with this email already exists"
            });
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedpassword,
            role: role || 'jobseeker'
        });

        // Auto-generate token so the client can log in immediately
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
            token: token
        });
    } catch (error) {
        console.error("Register error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};


// LOGIN
const loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please fill all the fields"
            });
        }

        const availableuser = await User.findOne({
            email: email.toLowerCase()
        });

        if (!availableuser) {
            return res.status(400).json({
                message: "No account found with this email"
            });
        }

        const ispasswordcorrect = await bcrypt.compare(
            password,
            availableuser.password
        );

        if (!ispasswordcorrect) {
            return res.status(400).json({
                message: "Incorrect password. Please try again."
            });
        }

        const token = jwt.sign(
            { id: availableuser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: availableuser._id,
                name: availableuser.name,
                email: availableuser.email,
                role: availableuser.role
            },
            token: token
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};


// GET CURRENT LOGGED-IN USER (used to refresh session)
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("GetMe error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registeruser, loginuser, getMe };