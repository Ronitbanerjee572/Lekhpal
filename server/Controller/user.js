const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../Config/jwt_secret");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "30d" }
    );
};

async function handleUserSignup(req, res) {
    const { name, contactNo, email, password, pinCode, role } = req.body;

    try {
        if (!name || !contactNo || !email || !password || !pinCode) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const formattedContact = `+91-${contactNo}`;

        const userExist = await User.findOne({
            $or: [
                { email },
                { contactNo: formattedContact }
            ]
        });

        if (userExist) {
            return res.status(400).json({ message: "User already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            contactNo: formattedContact,
            email,
            password: hash,
            pinCode,
            role
        });

        if (user) {
            return res.status(200).json({
                _id: user._id,
                name: user.name,
                contactNo: user.contactNo,
                email: user.email,
                pinCode: user.pinCode,
                token: generateToken(user),
            });
        } else {
            return res.status(400).json({ message: "Invalid user data." });
        }

    } catch (err) {
        return res.status(500).json({ message: "Server Error: " + err.message });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return res.status(200).json({
                _id: user._id,
                name: user.name,
                contactNo: user.contactNo,
                email: user.email,
                pinCode: user.pinCode,
                role: user.role,
                token: generateToken(user),
            });
        } else {
            return res.status(400).json({ message: "Invalid password" });
        }

    } catch (err) {
        return res.status(500).json({ message: "Server Error: " + err.message });
    }
}

function getCurrentUser(req, res) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    return res.status(200).json({
        _id: user._id,
        name: user.name,
        contactNo: user.contactNo,
        email: user.email,
        pinCode: user.pinCode,
        role: user.role,
    });
}

async function updateUserProfile(req, res) {
    const userId = req.user._id;
    const { name, contactNo, email, role } = req.body;

    try {
        const formattedContact = `+91-${contactNo}`;
        const updateUser = await User.findByIdAndUpdate(userId, {
            name,
            contactNo: formattedContact,
            email,
            role
        }, { new: true, runValidators: true });

        if (!updateUser)
            return res.status(404).json({ message: 'User not found' });

        res.json(updateUser);
    } catch (err) {
        res.status(500).json({ message: 'Server error' , details: err});
    }

}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  getCurrentUser,
  updateUserProfile,
};