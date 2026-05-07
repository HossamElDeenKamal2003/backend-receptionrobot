const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");

const { Server } = require("socket.io");
const { connectDB } = require("./config/dbConfig");


require("./src/models/associations");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

global.io = io;
module.exports.io = io;
io.on("connection", (socket) => {
    console.log("🔥 CLIENT CONNECTED:", socket.id);

    socket.on("join-drivers", () => {
        console.log("🔥 join-drivers RECEIVED");
    });

    socket.on("disconnect", () => {
        console.log("❌ DISCONNECTED:", socket.id);
    });
});


console.log(`📦 App.js loaded in process ${process.pid}`);
console.log("USE_REDIS:", process.env.USE_REDIS);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
const authRoutes = require("./src/services/auth/authRoutes");
const ordersRoutes = require("./src/services/doctor/orders.routes");
const labRoutes = require("./src/services/lab/lab.routes");
const delRoutes = require("./src/services/delivery/del.routes");
const notificationRoutes = require("./src/services/notifications/notificationRoutes");

app.use("/api/users", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/doctor", ordersRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/delivery", delRoutes);
// server/routes/testRoutes.js (مؤقت للاختبار)
const PushToken = require('./src/services/notifications/PushToken');
app.post('/test-push', async (req, res) => {
    const { userId, title, body } = req.body;
    
    const pushToken = await PushToken.getByUserId(userId);
    
    if (pushToken) {
        await NotificationService.sendPushNotification(
            pushToken.token,
            title || '🧪 اختبار',
            body || 'هذه رسالة اختبار من السيرفر',
            { type: 'test' }
        );
        res.json({ success: true, message: 'Test notification sent' });
    } else {
        res.json({ success: false, message: 'No push token found' });
    }
});
// Health check
app.get("/", (req, res) => {
    res.json({
        message: "KamalFy API running 🚀"
    });
});

app.get("/about", (req, res) => {
    res.json({
        message: "About KamalFy"
    });
});

// Start server
(async () => {
    try {
        await connectDB();
        console.log("Database connected successfully 🚀");

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`📍 Auth API: http://localhost:${PORT}/api/auth`);
        });

    } catch (err) {
        console.error("Failed to connect DB:", err);
        process.exit(1);
    }
})();

module.exports = app;