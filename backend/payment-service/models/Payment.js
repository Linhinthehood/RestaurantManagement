const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  orderId: [{ type: Schema.Types.ObjectId, ref: 'Order', required: true }],
  paymentMethod: { type: String, enum: ['Cash', 'Momo'], required: true },
  totalAmount: { type: mongoose.Types.Decimal128, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema); 