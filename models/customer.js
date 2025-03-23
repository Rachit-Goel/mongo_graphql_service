const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  location: String,
  gender: String,
});

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
