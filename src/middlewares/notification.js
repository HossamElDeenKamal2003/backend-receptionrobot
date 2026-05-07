// server/middlewares/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: { ar: "غير مصرح به", en: "No token provided" }
            });
        }

        const token = authHeader.split(' ')[1];
        
        // فك تشفير الـ token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        // أضف المستخدم إلى req
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            message: { ar: "توكن غير صالح", en: "Invalid token" }
        });
    }
};

module.exports = { authenticate };