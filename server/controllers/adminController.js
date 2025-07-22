const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const adminUser = require('../models/adminUser');


const generateToken = (id) => {
    const token =  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '60d' ,   algorithm: 'HS256'});
    console.log(token)
    return token;
};


const register = asyncHandler(async (req, res) => {
    const { name, email, phone, password, profilePicture } = req.body;

    try {
        const existingUser = await adminUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);





        const user = await adminUser.create({
            name,
            email,
            phone,
            password: hashedPassword,
            profilePicture,
        });


        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await adminUser.findOne({ email });





        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const getAdminProfile = asyncHandler(async (req, res) => {
    try {
        const admin = await adminUser.findById(req.user.id);
        
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }
        
        res.status(200).json(admin);
    } catch (error) {
        console.error(`Error contains: ${error.message}`);
        res.status(500).json({ error: "Error fetching admin profile" });
    }
});

const updateAdminProfile = asyncHandler(async(req, res) => {
    try {
        const { name, email, phone, profilePicture } = req.body;
        const adminId = req.user._id;

        const admin = await adminUser.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

    
        const errors = {};

       
        if (name !== undefined) {
            if (!name || name.trim().length < 2) {
                errors.name = 'Name must be at least 2 characters long';
            }
        }

        if (email !== undefined) {
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.email = 'Please provide a valid email address';
            } else {
                const existingAdmin = await adminUser.findOne({ 
                    email: email.toLowerCase(), 
                    _id: { $ne: adminId } 
                });
                if (existingAdmin) {
                    errors.email = 'Email is already registered to another admin';
                }
            }
        }


        if (phone !== undefined) {
            if (!phone || phone.length < 10) {
                errors.phone = 'Phone number must be at least 10 digits';
            }
        }

      

       


        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors 
            });
        }

        const updateData = {}; 

        if (name !== undefined) updateData.name = name.trim();
        if (email !== undefined) updateData.email = email.toLowerCase().trim();
        if (phone !== undefined) updateData.phone = phone;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
       

        
        const updatedAdmin = await adminUser.findByIdAndUpdate(
            adminId,
            { 
                ...updateData,
                updatedAt: new Date()
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');

        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            _id: updatedAdmin._id,
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            phone: updatedAdmin.phone,
            profilePicture: updatedAdmin.profilePicture,
            createdAt: updatedAdmin.createdAt,
            updatedAt: updatedAdmin.updatedAt
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors 
            });
        }

        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

module.exports = { register, login, getAdminProfile,updateAdminProfile };
