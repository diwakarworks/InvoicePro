const asyncHandler = require('express-async-handler')
const Payment = require('../models/Payment')
const Invoice = require('../models/Invoice')
const Client = require('../models/Client');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const webhook = asyncHandler(async (req, res) => {
    try {
        const { invoiceId, status, amount } = req.body
        if (!invoiceId || !status || !amount) {
            return res.status(400).json({ message: 'Missing payment details' });
        }
        const payment = await Payment.create({ invoiceId, status, amount, paidAt: new Date() });
        if (status == 'paid') {
            await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid' });
        }
        else {
            return res.status(400).json({ message: 'Payment Failed' })
        }
        return res.status(200).json({ message: 'Webhook processed', payment })
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' });
    }

})

const getPayments = asyncHandler(async(req,res)=> {
    try{
        const payment = await Payment.find();
        if (!payment){
            return res.status(404).json({message: "Payment not Found"})
        }
        return res.status(200).json(payment)
    }
    catch(error){
        console.error(`Error:${error.message}`)
        return res.status(500).json({message: "Internal Server Error"})
    }
})

const createCheckoutSession = asyncHandler(async (req, res) => {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    const client = await Client.findById(invoice.clientId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: client.email,
        line_items: invoice.items.map(item => ({
            price_data: {
                currency: 'inr',
                product_data:
                {
                    name: item.name || "Invoice Item",
                    description: item.description 
                },
                unit_amount:  Math.round(item.amount * 100)
            },
            quantity:  1,
        })),
        mode: 'payment',
        success_url: `https://invoice-pro-lac.vercel.app/success?invoiceId=${invoice._id}`,
        cancel_url:   `https://invoice-pro-lac.vercel.app/failure?invoiceId=${invoice._id}`,
        metadata: {
            invoiceId: invoice._id.toString(),
        },
    });

    res.status(200).json({ sessionUrl: session.url });
});



module.exports = { webhook, getPayments, createCheckoutSession };
