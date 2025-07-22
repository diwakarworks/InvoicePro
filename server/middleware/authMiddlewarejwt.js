require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/adminUser');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
  
    
    if (!token) {
        return res.status(401).json({ message: 'Token Not Found' });
    }
    
;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
        
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        next();
    } catch (error) {
        console.error(`Error : ${error.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = { protect };