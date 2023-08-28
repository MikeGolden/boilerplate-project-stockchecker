const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
  symbol: {type: String, required: true},
  likes: {type: [String], default: []}
});

const Stock = mongoose.model('Stock', stockSchema);

exports.Stock = Stock