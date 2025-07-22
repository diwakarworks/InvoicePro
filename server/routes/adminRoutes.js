const express = require('express');
const {register,login,getAdminProfile,updateAdminProfile} = require('../controllers/adminController');
const {protect} = require('../middleware/authMiddlewarejwt');
const router = express.Router();

router.post('/register',register)
router.post('/login',login);
router.get('/profile',protect,getAdminProfile);
router.put('/profile',protect,updateAdminProfile);

module.exports = router;