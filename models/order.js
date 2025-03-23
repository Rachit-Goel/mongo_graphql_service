const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  products: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number, priceAtPurchase: Number }],
  totalAmount: Number,
  orderDate: Date,
  status: String,
});

OrderSchema.index({ customerId: 1, orderDate: -1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ "products.productId": 1 });

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
