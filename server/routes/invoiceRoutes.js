const express = require('express');
const {getInvoices,getInvoiceById, createInvoice, markPaid,downloadPDF} = require("../controllers/invoiceController");
const auth = require('../middleware/authmiddleware');

const router = express.Router();

router.use(auth);

router.get('/', getInvoices);
router.get('/:id',getInvoiceById)
router.post('/', createInvoice);
router.put('/:id/mark-paid', markPaid);
router.get('/:id/pdf', downloadPDF);

module.exports = router;


