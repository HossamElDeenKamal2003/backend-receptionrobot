// app.js
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// const router = require('./src/domain/interface/routes/index.js');
const { connectDB } = require('./config/dbConfig');

console.log(`📦 App.js loaded in process ${process.pid}`);
console.log('USE_REDIS in app.js:', process.env.USE_REDIS);

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

/*
  ⚠️ مهم: خليك حاطط routes بعد middleware لكن قبل error handler
*/
// app.use('/', router);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "KamalFy API running 🚀" });
});

app.get("/about", (req, res) => {
  res.json({ message: "About KamalFy" });
});

// Auth routes
const authRoutes = require('./src/services/auth/authRoutes');
const ordersRoutes = require('./src/services/doctor/orders.routes');
const labRoutes = require('./src/services/lab/lab.routes');

app.use('/api/doctor', ordersRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/auth', authRoutes);

/*
  🟢 PostgreSQL connection (Sequelize)
*/
(async () => {
  try {
    await connectDB();
    console.log("Database connected successfully 🚀");
    
    // Start server only after database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
    });
    
  } catch (err) {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  }
})();

module.exports = app;