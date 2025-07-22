const sgMail = require("@sendgrid/mail");
require('dotenv').config();
const asyncHandler = require('express-async-handler');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendInvoiceEmail = asyncHandler(async ({to, subject, text, html,pdfBuffer,invoiceId}) => {
    const msg = {
        to,
        from: process.env.SENDGRID_SENDER,
        subject,
        text,
        html,
        attachments :  [
            {
                content:  pdfBuffer.toString('base64'),
                filename: `invoice-${invoiceId}.pdf`,
                type: 'application/pdf',
                disposition: 'attachment'
            }
        ]
    };
    try{
        await sgMail.send(msg);
        console.log(`Email sent to ${to}`);
    }
    catch(error){
        console.error(`Error sending email to ${to}:`, error.response ?.body || error.message);
    }
});

module.exports = {sendInvoiceEmail};

