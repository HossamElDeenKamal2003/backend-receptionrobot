// config/imagekit.js
const ImageKit = require('imagekit');
const fs = require('fs');

// إعدادات ImageKit من ملف .env
const imagekit = new ImageKit({
    publicKey: process.env.PUBLIC_KEY_IMAGE_KEY,
    privateKey: process.env.PRIVATE_KEY_IMAGE_KEY,
    urlEndpoint: process.env.URL_ENDPOINT_IMAGE_KIT
});

// دالة رفع ملف إلى ImageKit
const uploadToImageKit = async (filePath, fileName, folder) => {
    try {
        // قراءة الملف
        const fileData = fs.readFileSync(filePath);
        const base64 = fileData.toString('base64');
        
        const result = await imagekit.upload({
            file: base64,
            fileName: fileName,
            folder: folder,
            useUniqueFileName: true,
            isPrivateFile: false
        });
        
        // حذف الملف المؤقت بعد الرفع
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        return {
            success: true,
            url: result.url,
            fileId: result.fileId,
            filePath: result.filePath
        };
    } catch (error) {
        console.error('ImageKit upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// دالة حذف صورة من ImageKit
const deleteFromImageKit = async (fileId) => {
    try {
        if (fileId) {
            await imagekit.deleteFile(fileId);
            return true;
        }
    } catch (error) {
        console.error('ImageKit delete error:', error);
    }
    return false;
};

module.exports = {
    imagekit,
    uploadToImageKit,
    deleteFromImageKit
};