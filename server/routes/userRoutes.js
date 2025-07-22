const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const auth = require('../middleware/authmiddleware');
const router = express.Router();

router.get('/profile', auth, getUserProfile);

module.exports = router;

