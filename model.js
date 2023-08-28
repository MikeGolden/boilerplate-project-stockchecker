const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  symbol: String,
  price: Number,
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
});

module.exports = mongoose.model('Stock', StockSchema);