const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  stock: Number,
});

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);