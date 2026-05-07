// server/models/PushToken.js
const User = require('../../models/users');

class PushToken {
    // حفظ أو تحديث push token
    static async save(userId, token, platform = 'android') {
        console.log("🔔 Saving push token for user:", userId, "Token:", token, "Platform:", platform);
        try {
            const [user, created] = await User.upsert({
                id: userId,
                token: token,
                platform: platform,
                updated_at: new Date()
            });
            
            console.log('✅ Push token saved for user:', userId);
            return user;
        } catch (error) {
            console.error('❌ Error saving push token:', error);
            throw error;
        }
    }

    // جلب push token لمستخدم
    static async getByUserId(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['token', 'platform']
            });
            
            if (user && user.token) {
                return { token: user.token, platform: user.platform };
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting push token:', error);
            return null;
        }
    }

    // جلب جميع push tokens (لأجهزة متعددة - لو عندك أكثر من جهاز)
    static async getAllByUserId(userId) {
        // بما أن الحقول في نفس الجدول، هنرجع array فيه جهاز واحد
        const token = await this.getByUserId(userId);
        return token ? [token] : [];
    }

    // حذف push token
    static async delete(userId, token = null) {
        try {
            if (token) {
                await User.update(
                    { token: null, platform: null },
                    { where: { id: userId, token: token } }
                );
            } else {
                await User.update(
                    { token: null, platform: null },
                    { where: { id: userId } }
                );
            }
            console.log('✅ Push token deleted for user:', userId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting push token:', error);
            throw error;
        }
    }
}

module.exports = PushToken;