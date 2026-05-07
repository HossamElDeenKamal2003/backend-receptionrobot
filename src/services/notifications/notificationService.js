const fetch = require('node-fetch');
const PushToken = require('./PushToken');

class NotificationService {
    // إرسال push notification
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
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error sending push notification:', error);
            return null;
        }
    }

    // إرسال إشعار لمعمل عند طلب جديد
    static async notifyNewOrder(labId, order) {
        const pushToken = await PushToken.getByUserId(labId);
        
        if (pushToken && pushToken.token) {
            await this.sendPushNotification(
                pushToken.token,
                '🦷 طلب جديد!',
                `طلب من المريض: ${order.patient_name}`,
                {
                    orderId: order.id,
                    type: 'new-order',
                    screen: 'order-details'
                }
            );
        }
    }

    // إرسال إشعار لدكتور عند تحديث الطلب
    static async notifyOrderUpdate(doctorId, order, statusText) {
        const pushToken = await PushToken.getByUserId(doctorId);
        
        if (pushToken && pushToken.token) {
            await this.sendPushNotification(
                pushToken.token,
                '📦 تحديث الطلب',
                `الطلب #${order.uid || order.id}: ${statusText}`,
                {
                    orderId: order.id,
                    type: 'order-update',
                    screen: 'order-details'
                }
            );
        }
    }
}

module.exports = NotificationService;