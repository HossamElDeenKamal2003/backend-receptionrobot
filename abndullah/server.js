const dotenv = require("dotenv");
dotenv.config(); 

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

console.log(`📦 App.js loaded in process ${process.pid}`);

const app = express();

const MONGO_URI = "mongodb+srv://boshtahoma:hossam_2003@cluster0.cfyzhfx.mongodb.net/abdullah?retryWrites=true&w=majority&appName=Cluster0";
const products = require('./routes/products');
// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet()); 
app.use(morgan("dev"));

// ✅ Route
app.get('/', (req, res) => {
  res.send("connected");
});
app.use('/products', products)

// ✅ Connect DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

app.get('/get1r', async(req, res)=>{
  const products = await Product.find({ priceAfterTax: 1 });
  return res.status(200).json({
    data: {
      products
    }
  })
})

// ✅ Start Server بعد الاتصال
const startServer = async () => {
  await connectDB();

  app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
  });
};
const Counter = require('./model/counter')
// ✅ Reset SKU counter
app.post('/reset-sku', async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "productSku" },
      { value: 0 },      // تصفير
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "SKU counter reset to 0",
      counterValue: counter.value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
const Product = require('./model/products');
const ExcelJS = require('exceljs');

app.get('/products-excel', async (req, res) => {
  try {
    const products = await Product.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // أول صف (الهيدر)
    worksheet.addRow([
      'SKU',
      'Product Name',
      'Price Before Tax',
      'Price After Tax',
      'Quantity',
    ]);

    // باقي الصفوف
    products.forEach(p => {
      worksheet.addRow([
        p.sku,
        p.title,
        p.priceBeforeTax,
        p.priceAfterTax,
        p.quantity,
      ]);
    });

    // تخلي الهيدر Bold
    worksheet.getRow(1).font = { bold: true };

    // تحميل الملف
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=products.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

startServer();

module.exports = app;
