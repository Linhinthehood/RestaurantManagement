const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  orderStatus: { type: String, enum: ['serving', 'completed'], default: 'serving', required: true },
  orderStatusHistory: [{
    status: { type: String, enum: ['serving', 'completed'] },
    changedAt: { type: Date, default: Date.now }
  }],
  orderItemId: [{ type: Schema.Types.ObjectId, ref: 'OrderItem' }],
  totalPrice: { type: mongoose.Types.Decimal128, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema); 