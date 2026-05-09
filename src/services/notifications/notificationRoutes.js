const express = require('express');
const router = express.Router();
const PushToken = require('./PushToken');
const { labMiddleware } = require('../../middlewares/auth');
const { authenticate } = require('../../middlewares//notification');
const User = require('../../models/users');
// حفظ push token
router.post('/push-token', authenticate, async (req, res) => {
    try {
        const { pushToken, platform } = req.body;
        const userId = req.user.id;  // دلوقتي req.user موجود

        console.log('📥 Saving push token for user:', userId);
        console.log('📱 Push token:', pushToken);

        if (!pushToken) {
            return res.status(400).json({
                success: false,
                message: 'Push token is required'
            });
        }

        await User.update(
            { token: pushToken, platform: platform || 'android' },
            { where: { id: userId } }
        );

        res.json({ success: true, message: 'Push token saved' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// حذف push token (عند تسجيل الخروج)
router.delete('/push-token',authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        await PushToken.delete(userId);
        res.json({ success: true, message: 'Push token deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;