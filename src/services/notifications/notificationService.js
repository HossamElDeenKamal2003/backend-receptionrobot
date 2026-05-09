const axios = require('axios');
const PushToken = require('./PushToken');

class NotificationService {
    static async sendPushNotification(expoPushToken, title, body, data = {}) {
        if (!expoPushToken) return null;

        const message = {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
            priority: 'high',
        };

        try {
            const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            
            console.log('✅ Push notification sent via Expo:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error sending push notification:', error.response?.data || error.message);
            return null;
        }
    }

    static async notifyNewOrder(labId, order) {
        try {
            const pushToken = await PushToken.getByUserId(labId);
            if (pushToken && pushToken.token) {
                console.log(`📱 Sending Expo notification to lab ${labId}`);
                await this.sendPushNotification(
                    pushToken.token,
                    '🦷 طلب جديد!',
                    `طلب من المريض: ${order.patient_name}`,
                    { orderId: order.id.toString(), type: 'new-order' }
                );
            } else {
                console.log(`⚠️ No push token found for lab ${labId}`);
            }
        } catch (error) {
            console.error('Error in notifyNewOrder:', error.message);
        }
    }

    static async notifyOrderUpdate(doctorId, order, statusText) {
        try {
            const pushToken = await PushToken.getByUserId(doctorId);
            if (pushToken && pushToken.token) {
                console.log(`📱 Sending Expo notification to doctor ${doctorId}`);
                await this.sendPushNotification(
                    pushToken.token,
                    '📦 تحديث الطلب',
                    `الطلب #${order.uid || order.id}: ${statusText}`,
                    { orderId: order.id.toString(), type: 'order-update' }
                );
            } else {
                console.log(`⚠️ No push token found for doctor ${doctorId}`);
            }
        } catch (error) {
            console.error('Error in notifyOrderUpdate:', error.message);
        }
    }
}

module.exports = NotificationService;