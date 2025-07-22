const express = require('express');
const {webhook,getPayments, createCheckoutSession} = require('../controllers/paymentController');
const router = express.Router();
const auth = require('../middleware/authmiddleware');

router.post('/webhook', webhook);
router.get('/',auth,getPayments)
router.post('/checkout-session',auth,createCheckoutSession)
module.exports = router;


