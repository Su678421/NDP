const mongoose = require('mongoose');

const BeneficiarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  phone: { type: String },
  idCard: { type: String },
  address: { type: String },
  description: { type: String },
  needType: { type: String, enum: ['money', 'goods', 'both'], default: 'both' },
  needAmount: { type: Number, default: 0 },
  needGoods: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Beneficiary', BeneficiarySchema);
