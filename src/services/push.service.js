// services/push.service.js
const fetch = require('node-fetch');

// تخزين Push Tokens (استخدم قاعدة بيانات في الإنتاج)
const pushTokens = new Map(); // userId -> [{ token, role, deviceName, addedAt }]

// إضافة Push Token
async function addPushToken(req, res) {
  const { userId, role, pushToken, deviceName } = req.body;
  
  if (!userId || !pushToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'userId and pushToken are required' 
    });
  }
  
  if (!pushTokens.has(userId)) {
    pushTokens.set(userId, []);
  }
  
  const userTokens = pushTokens.get(userId);
  const existingToken = userTokens.find(t => t.token === pushToken);
  
  if (!existingToken) {
    userTokens.push({
      token: pushToken,
      role: role || 'unknown',
      deviceName: deviceName || 'Unknown',
      addedAt: new Date()
    });
    console.log(`📱 Push token registered for user ${userId} (${role || 'unknown'})`);
  } else {
    existingToken.updatedAt = new Date();
    console.log(`📱 Push token updated for user ${userId}`);
  }
  
  res.json({ success: true, message: 'Push token registered' });
}

// إرسال Push Notification
async function sendPushNotification(userId, role, order) {
  const userTokens = pushTokens.get(userId) || [];
  
  if (userTokens.length === 0) {
    console.log(`⚠️ No push tokens for user ${userId}`);
    return false;
  }
  
  let title = '';
  let body = '';
  let screen = '';
  
  switch (role) {
    case 'lab':
      title = `🧪 طلب جديد #${order.id}`;
      body = `المريض: ${order.patient_name || 'غير محدد'} | الخدمة: ${order.type || 'غير محددة'}`;
      screen = '/lab/orders';
      break;
    case 'delivery':
      title = `🚚 طلب جاهز للتوصيل #${order.id}`;
      body = `من: ${order.lab?.username || 'المعمل'} | إلى: ${order.doctor?.username || 'الدكتور'}`;
      screen = '/delivery';
      break;
    case 'doctor':
      title = `👨‍⚕️ طلب قادم إليك #${order.id}`;
      body = `المريض: ${order.patient_name || 'غير محدد'} | في الطريق إليك`;
      screen = '/doctor/all-orders';
      break;
    default:
      title = `📦 طلب جديد #${order.id}`;
      body = `تم استلام طلب جديد`;
      screen = '/';
  }
  
  let successCount = 0;
  
  for (const { token } of userTokens) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
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
          data: { 
            orderId: order.id, 
            screen: screen,
            role: role
          },
          sound: 'default',
          priority: 'high',
        }),
      });
      
      const result = await response.json();
      if (result.data?.status === 'ok') {
        successCount++;
        console.log(`📱 Push notification sent to ${role} ${userId}`);
      } else {
        console.log(`⚠️ Push notification failed: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send push notification to ${role}:`, error.message);
    }
  }
  
  return successCount > 0;
}

// حذف Push Token
async function removePushToken(userId, pushToken) {
  if (pushTokens.has(userId)) {
    const tokens = pushTokens.get(userId);
    const filtered = tokens.filter(t => t.token !== pushToken);
    if (filtered.length === 0) {
      pushTokens.delete(userId);
    } else {
      pushTokens.set(userId, filtered);
    }
    console.log(`📱 Push token removed for user ${userId}`);
  }
}

// جلب جميع Push Tokens لمستخدم
function getUserPushTokens(userId) {
  return pushTokens.get(userId) || [];
}

module.exports = {
  addPushToken,
  sendPushNotification,
  removePushToken,
  getUserPushTokens
};