// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/users"); // تأكد من المسار الصحيح

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware أساسي للمصادقة
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: {
                    ar: "غير مصرح به - الرجاء تسجيل الدخول",
                    en: "Unauthorized - Please login"
                }
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // البحث عن المستخدم في قاعدة البيانات
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: {
                    ar: "المستخدم غير موجود",
                    en: "User not found"
                }
            });
        }
        
        // إضافة المستخدم للـ request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: {
                    ar: "توكن غير صالح",
                    en: "Invalid token"
                }
            });
        }
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: {
                    ar: "انتهت صلاحية التوكن",
                    en: "Token expired"
                }
            });
        }
        
        return res.status(500).json({
            success: false,
            message: {
                ar: "خطأ في الخادم",
                en: "Server error"
            }
        });
    }
};

// Middleware للتحقق من دور المعمل (Lab)
const labMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: {
                ar: "غير مصرح به",
                en: "Unauthorized"
            }
        });
    }
    
    if (req.user.role !== 'lab') {
        return res.status(403).json({
            success: false,
            message: {
                ar: "غير مصرح - هذه الخدمة مخصصة للمعامل فقط",
                en: "Forbidden - This service is only for labs"
            }
        });
    }
    
    next();
};

// Middleware للتحقق من دور الدكتور (Doctor)
const doctorMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: {
                ar: "غير مصرح به",
                en: "Unauthorized"
            }
        });
    }
    
    if (req.user.role !== 'doctor') {
        return res.status(403).json({
            success: false,
            message: {
                ar: "غير مصرح - هذه الخدمة مخصصة للأطباء فقط",
                en: "Forbidden - This service is only for doctors"
            }
        });
    }
    
    next();
};

// Middleware للتحقق من دور العيادة (Clinic)
const clinicMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: {
                ar: "غير مصرح به",
                en: "Unauthorized"
            }
        });
    }
    
    if (req.user.role !== 'clinic') {
        return res.status(403).json({
            success: false,
            message: {
                ar: "غير مصرح - هذه الخدمة مخصصة للعيادات فقط",
                en: "Forbidden - This service is only for clinics"
            }
        });
    }
    
    next();
};

// Middleware للتحقق من أدوار متعددة (مثلاً Lab أو Admin)
const allowRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: {
                    ar: "غير مصرح به",
                    en: "Unauthorized"
                }
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: {
                    ar: `غير مصرح - هذه الخدمة مخصصة لـ ${roles.join(' أو ')} فقط`,
                    en: `Forbidden - This service is only for ${roles.join(' or ')}`
                }
            });
        }
        
        next();
    };
};

// تصدير كل الميدلوير
module.exports = {
    authMiddleware,
    labMiddleware,
    doctorMiddleware,
    clinicMiddleware,
    allowRoles
};