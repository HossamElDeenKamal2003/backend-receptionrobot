// backend/pushService.js
const fetch = require('node-fetch');

// تخزين Push Tokens (مؤقت - استخدم قاعدة بيانات في الحقيقة)
const pushTokens = new Map(); // userId -> { token, role }

// إضافة Push Token
async function addPushToken(req, res) {
  const { userId, role, pushToken, deviceName } = req.body;
  
  if (!pushTokens.has(userId)) {
    pushTokens.set(userId, []);
  }
  
  pushTokens.get(userId).push({
    token: pushToken,
    role: role,
    deviceName: deviceName,
    addedAt: new Date()
  });
  
  console.log(`Push token registered for user ${userId} (${role})`);
  res.json({ success: true });
}

// إرسال Push Notification
async function sendPushNotification(userId, role, order) {
  const userTokens = pushTokens.get(userId) || [];
  
  let title = '';
  let body = '';
  let screen = '';
  
  if (role === 'lab') {
    title = `طلب جديد #${order.id}`;
    body = `المريض: ${order.patient_name} | الخدمة: ${order.type}`;
    screen = '/lab/orders';
  } else if (role === 'delivery') {
    title = `طلب جاهز للتوصيل #${order.id}`;
    body = `من: ${order.lab?.username} | إلى: ${order.doctor?.username}`;
    screen = '/delivery';
  } else if (role === 'doctor') {
    title = `طلب قادم إليك #${order.id}`;
    body = `المريض: ${order.patient_name} | في الطريق إليك`;
    screen = '/doctor/all-orders';
  }
  
  for (const { token } of userTokens) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          title: title,
          body: body,
          data: { orderId: order.id, screen: screen },
          sound: 'default',
        }),
      });
      console.log(`Push notification sent to ${role} ${userId}`);
    } catch (error) {
      console.error(`Failed to send push notification to ${role}:`, error);
    }
  }
}

module.exports = { addPushToken, sendPushNotification };