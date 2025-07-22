const PDFDocument = require('pdfkit');
const fs = require('fs');
const asyncHandler = require('express-async-handler');

const generatePDF = (invoice, filePath) => {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));
    doc.text(`Client ID: ${invoice.clientId}`)
    doc.text(`Invoice ID: ${invoice._id}`);
    doc.text(`Total : ${invoice.total}`);
    doc.end();
};

const generatePDFBuffer = asyncHandler(async (invoice) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];
        
    
        doc.on('data', buffers.push.bind(buffers));
        
        
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });
        
        doc.on('error', reject);
        
       
        doc.text(`Client ID: ${invoice.clientId}`);
        doc.text(`Invoice ID: ${invoice._id}`);
        doc.text(`Total: ${invoice.total}`);
        
        doc.end();
    });
});


module.exports = { generatePDF, generatePDFBuffer };
