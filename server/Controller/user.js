const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ethers } = require("ethers");
const { JWT_SECRET } = require("../Config/jwt_secret");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// Generate a random wallet for the user
const generateUserWallet = () => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
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

        // Generate wallet address for the user
        const walletAddress = generateUserWallet();

        const user = await User.create({
            name,
            contactNo: formattedContact,
            email,
            password: hash,
            pinCode,
            role,
            walletAddress
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
    const { name, contactNo, email, role, pinCode } = req.body;

    try {
        console.log('Update request body:', { name, contactNo, email, role, pinCode });
        
        const updateData = {};
        
        // Update fields if they are provided (even if empty string, we check for undefined)
        if (name !== undefined && name.trim() !== '') updateData.name = name.trim();
        if (email !== undefined && email.trim() !== '') updateData.email = email.trim();
        if (contactNo !== undefined && contactNo.trim() !== '') {
            // Remove +91- prefix if present, then add it back
            const cleanContact = contactNo.replace(/^\+91-?/, '').trim();
            updateData.contactNo = `+91-${cleanContact}`;
        }
        if (role !== undefined) updateData.role = role;
        // Always update pinCode if provided
        if (pinCode !== undefined) {
            const trimmedPinCode = String(pinCode).trim();
            // Validate pinCode is 6 digits
            if (trimmedPinCode.length === 6 && /^\d{6}$/.test(trimmedPinCode)) {
                updateData.pinCode = trimmedPinCode;
                console.log('PinCode will be updated to:', trimmedPinCode);
            } else if (trimmedPinCode === '') {
                // Allow empty string but warn
                console.warn('Empty pinCode provided, skipping update');
            } else {
                return res.status(400).json({ 
                    message: 'Pin code must be exactly 6 digits',
                    error: `Invalid pin code: "${trimmedPinCode}" (length: ${trimmedPinCode.length})`
                });
            }
        } else {
            console.log('PinCode not provided in request body');
        }
        
        console.log('Update data to be saved:', updateData);

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const updateUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updateUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Updated user pinCode:', updateUser.pinCode);
        console.log('Updated user data:', {
            name: updateUser.name,
            email: updateUser.email,
            contactNo: updateUser.contactNo,
            pinCode: updateUser.pinCode,
            role: updateUser.role
        });

        res.status(200).json({
            _id: updateUser._id,
            name: updateUser.name,
            contactNo: updateUser.contactNo,
            email: updateUser.email,
            pinCode: updateUser.pinCode,
            role: updateUser.role,
            message: 'Profile updated successfully'
        });
    } catch (err) {
        console.error('Update profile error:', err);
        // Handle validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                error: Object.values(err.errors).map(e => e.message).join(', ')
            });
        }
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        });
    }

}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  getCurrentUser,
  updateUserProfile,
};