const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const registeruser = async (req, res) => {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please fill all the fields"
        });
    }

    const existinguser = await User.findOne({ email: email });

    if (existinguser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name: name,
        email: email,
        password: hashedpassword,
        role: role
    });

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }
    });
};


// LOGIN
const loginuser = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please fill all the fields"
        });
    }

    const availableuser = await User.findOne({
        email: email
    });

    if (!availableuser) {
        return res.status(400).json({
            message: "User does not exist"
        });
    }

    const ispasswordcorrect = await bcrypt.compare(
        password,
        availableuser.password
    );

    if (!ispasswordcorrect) {
        return res.status(400).json({
            message: "Invalid credentials"
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
};

module.exports = { registeruser, loginuser };