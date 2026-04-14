const mongoose = require('mongoose');
const Counter = require('./counter');

const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    unique: true
  },
  quantity: {
    type: Number,
    required: true
  }, 
  priceBeforeTax: {
    type: Number,
    required: true
  },
  priceAfterTax: {
    type: Number,
    required: true
  },
  category: {
    type: String
  }
}, {
  timestamps: true
});


const productsModel = mongoose.model('products', productsSchema);

module.exports = productsModel;
