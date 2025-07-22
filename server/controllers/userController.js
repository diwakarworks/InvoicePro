const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const logger = require('../utils/logger');

const getUserProfile = asyncHandler(async (req, res) => {
    try{
        console.log('auth0Id:', req.auth.sub);
        const user = await User.findOne({authOId:req.auth.sub});
        if (!user) {
            return res.status(404).json({ message: 'UserId not found' });
        }
        logger.auth('Fetched Profile Successfully')
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = {
    getUserProfile
};