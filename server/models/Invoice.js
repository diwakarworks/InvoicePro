const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: String, required: true },      
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  items: [
    {
      description: String,
      amount: Number,
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
