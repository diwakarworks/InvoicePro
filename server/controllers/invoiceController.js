const asyncHandler = require('express-async-handler')
const Invoice = require('../models/Invoice');
const path = require('path');
const fs = require('fs');
const Client = require('../models/Client');
const { sendInvoiceEmail } = require('../services/emailservice');
const { generatePDF, generatePDFBuffer } = require('../services/pdfservices');
const logger = require('../utils/logger');

const getInvoices = asyncHandler(async (req, res) => {
    try {
        const userSub = req.auth?.sub || req.user?.sub;
        const invoices = await Invoice.find({
            $or: [
                { userId: userSub },
                { userId: `${userSub}@clients`, }

            ]
        });
        return res.status(200).json(invoices);
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

const getInvoiceById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        return res.status(200).json(invoice);
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' });

    }
});


const createInvoice = asyncHandler(async (req, res) => {
    try {
        const { clientId, items, dueDate } = req.body;

        if (!clientId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Client ID and items are required.' });
        }

        const userId = req.auth?.sub || req.user?.id

        const total = items.reduce((sum, item) => sum + item.amount, 0);

        const client = await Client.findOne({ _id: clientId, userId: userId });

        console.log('Looking for client with:', { clientId, userId });

        if (!client) {
            return res.status(404).json({ message: 'Client not found or unauthorized.' });
        }

        const invoice = new Invoice({
            clientId,
            userId: userId,
            items,
            total,
            dueDate,
            status: 'unpaid',
        });
        await invoice.save();



        const invoicesDir = path.join(process.cwd(), 'invoices');
        if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);
        const filePath = path.join(invoicesDir, `invoice-${invoice._id}.pdf`);
        generatePDF(invoice, filePath);
        invoice.pdfUrl = `/invoices/invoice-${invoice._id}.pdf`;


        const pdfBuffer = await generatePDFBuffer(invoice);
        await sendInvoiceEmail({
            to: client.email,
            subject: 'Your Invoice from InvoicelyPro',
            text: 'Please find your invoice attached.',
            html: `
        <div style="font-family: Arial, sans-serif;">
        <p>Hello ${client.name},</p>
        <p>Please find your invoice attached.</p>
      
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Invoice Summary</h3>
        <p><strong>Invoice ID:</strong> ${invoice._id}</p>
        <p><strong>Total Amount:</strong> ₹${invoice.total.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}</p>
        <p><strong>Items:</strong> ${items.length} items</p>
        </div>
      
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Thank you for your business!</p>
        </div>
  `,
            pdfBuffer,
            invoiceId: invoice._id,
        });

        await invoice.save();
        logger.invoice(`Invoice ${invoice._id} created and emailed to ${client.email}`);

        return res.status(201).json({ message: 'Invoice created Successfully', invoice });
    } catch (error) {
        console.error('Error creating invoice:', error.message);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

const markPaid = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            { _id: id, userId: req.auth.sub },
            { status: 'paid' },
            { new: true });
        if (!updatedInvoice) {
            return res.status(404).json({ message: 'Invoice not found or unauthorized.' });
        }
        res.json(updatedInvoice);
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' });

    }
});
const downloadPDF = asyncHandler(async (req, res) => {
    try {
        const invoiceId = req.params.id;
        if (!invoiceId) {
            return res.status(404).json({ message: 'Invoice Id not found' })
        }
        const fileName = `invoice-${invoiceId}.pdf`;
        const filePath = path.join(process.cwd(), 'invoices', fileName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error sending file:', err.message);
                return res.status(500).json({ message: 'Failed to send file' });
            }
        });
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = { getInvoices, getInvoiceById, createInvoice, markPaid, downloadPDF }