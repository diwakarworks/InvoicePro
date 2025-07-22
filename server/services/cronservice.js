const cron = require('node-cron');
const logger = require('../utils/logger');
const Invoice = require('../models/Invoice');
const asyncHandler = require("express-async-handler");

cron.schedule('0 9 * * *', asyncHandler(async () => {
    try {
        const today = new Date();
        const overdue = await Invoice.find({
            dueDate: { $lt: today },
            status: 'unpaid'
        });
       overdue.forEach(invoice => {
            logger.warn(`[INVOICE] Reminder: Invoice #${invoice._id} is overdue`);
       });
        logger.info(`[CRON] Ran daily reminder check. Found ${overdue.length} overdue invoices.`);
    } catch (error) {
         logger.error(`[CRON] Error running invoice reminder: ${error.message}`);
    }
}));
