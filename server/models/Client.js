const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
  userId: { type: String }, 
  name: { type: String, required: true },
  email: { type: String,required: true  },
  phone: { type: String },
  company: { type: String },
}, 
{ timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
