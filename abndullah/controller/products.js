const Product = require('../model/products');
const Counter = require('../model/counter');

exports.createProduct = async (req, res) => {
  try {
    const data = req.body;

    // الحصول على آخر منتج تم إنشاؤه
    const lastProduct = await Product.findOne().sort({ createdAt: -1 });
    
    let newSku;
    let newNumber;
    
    if (lastProduct && lastProduct.sku) {
      // استخراج الرقم من الـ SKU
      // إزالة الـ "00" من البداية
      let lastNumber;
      if (lastProduct.sku.startsWith('00')) {
        const numberPart = lastProduct.sku.substring(2);
        lastNumber = parseInt(numberPart);
      } else {
        lastNumber = parseInt(lastProduct.sku);
      }
      
      newNumber = lastNumber + 1;
      
      // إنشاء SKU: "00" + الرقم (بدون padding)
      newSku = `00${newNumber}`;
      
    } else {
      // أول منتج: 001
      newSku = "001";
      newNumber = 1;
    }

    console.log('Generated SKU:', newSku);

    const product = await Product.create({
      title: data.title,
      quantity: data.quantity,
      priceBeforeTax: data.priceBeforeTax,
      priceAfterTax: data.priceAfterTax,
      category: data.category,
      sku: newSku
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
