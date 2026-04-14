// config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToImageKit, deleteFromImageKit } = require('./imageKit');

// التأكد من وجود المجلدات للتخزين المؤقت
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// تخزين مؤقت للملفات قبل الرفع على ImageKit
const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/temp';
        ensureDirExists(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// فلتر الملفات
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('صور فقط مسموح بها (JPEG, PNG, WEBP)'), false);
    }
};

// Middleware لرفع ملفات التاجر
const uploadSellerFiles = multer({
    storage: tempStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10
    }
}).fields([
    { name: 'imageOfIban', maxCount: 1 },
    { name: 'commercialRegisterImage', maxCount: 1 },
    { name: 'taxCertificateImage', maxCount: 1 },
    { name: 'taxRegistrationImage', maxCount: 1 },
    { name: 'documentingeCommerceImage', maxCount: 1 },
    { name: 'storeLogo', maxCount: 1 },
    { name: 'storeBanner', maxCount: 1 }
]);

// دالة رفع الملفات إلى ImageKit
const uploadFilesToImageKit = async (files, traderId) => {
    const uploadedUrls = {};
    
    if (!files) return uploadedUrls;
    
    for (const [fieldName, fileArray] of Object.entries(files)) {
        if (fileArray && fileArray[0]) {
            const file = fileArray[0];
            const timestamp = Date.now();
            const fileName = `${fieldName}-${traderId}-${timestamp}`;
            const folder = `traders/${traderId}/documents`;
            
            const result = await uploadToImageKit(file.path, fileName, folder);
            
            if (result.success) {
                uploadedUrls[fieldName] = result.url;
                uploadedUrls[`${fieldName}_fileId`] = result.fileId;
            } else {
                console.error(`Failed to upload ${fieldName}:`, result.error);
            }
        }
    }
    
    return uploadedUrls;
};

// دالة مسح الملفات المؤقتة
const deleteTempFiles = (files) => {
    if (!files) return;
    
    for (const fileArray of Object.values(files)) {
        if (fileArray && Array.isArray(fileArray)) {
            fileArray.forEach(file => {
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
    }
};

// دالة مسح الملفات من ImageKit
const deleteFile = async (fileId) => {
    return await deleteFromImageKit(fileId);
};

module.exports = {
    uploadSellerFiles,
    uploadFilesToImageKit,
    deleteTempFiles,
    deleteFile
};