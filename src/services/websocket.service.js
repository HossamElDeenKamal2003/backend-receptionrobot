// services/websocket.service.js

// تخزين الاتصالات النشطة
const activeConnections = {
  labs: new Map(),      // labId -> socket
  delivery: new Map(),  // deliveryId -> socket
  doctors: new Map()    // doctorId -> socket
};

let ioInstance = null;

function initWebSocket(io) {
  ioInstance = io;
  
  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);
    
    // تسجيل المستخدم
    socket.on('register', (data) => {
      const { userId, role, token } = data;
      socket.userId = userId;
      socket.role = role;
      
      console.log(`📝 Registered: ${role} ${userId} with socket ${socket.id}`);
      
      if (role === 'lab') {
        activeConnections.labs.set(userId, socket);
      } else if (role === 'delivery') {
        activeConnections.delivery.set(userId, socket);
      } else if (role === 'doctor') {
        activeConnections.doctors.set(userId, socket);
      }
      
      socket.emit('registered', { 
        success: true, 
        message: `Connected as ${role}` 
      });
    });
    
    // Ping/Pong for keeping connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
    
    // قطع الاتصال
    socket.on('disconnect', () => {
      if (socket.userId && socket.role) {
        const roleMap = {
          'lab': activeConnections.labs,
          'delivery': activeConnections.delivery,
          'doctor': activeConnections.doctors
        };
        
        const map = roleMap[socket.role];
        if (map && map.has(socket.userId)) {
          map.delete(socket.userId);
          console.log(`🔴 Disconnected: ${socket.role} ${socket.userId}`);
        }
      }
    });
  });
}

// دالة لإرسال إشعار عبر WebSocket
async function notifyNewOrder(order, targetRole, targetId) {
  if (!ioInstance) {
    console.log('⚠️ WebSocket not initialized');
    return false;
  }
  
  let targetSocket = null;
  let roleMap = null;
  
  if (targetRole === 'lab') {
    roleMap = activeConnections.labs;
  } else if (targetRole === 'delivery') {
    roleMap = activeConnections.delivery;
  } else if (targetRole === 'doctor') {
    roleMap = activeConnections.doctors;
  }
  
  if (roleMap && roleMap.has(targetId)) {
    targetSocket = roleMap.get(targetId);
  }
  
  if (targetSocket && targetSocket.connected) {
    targetSocket.emit('new_order', order);
    console.log(`📡 WebSocket notification sent to ${targetRole} ${targetId}`);
    return true;
  }
  
  console.log(`⚠️ ${targetRole} ${targetId} not connected via WebSocket`);
  return false;
}

// دالة لجلب إحصائيات الاتصالات
function getConnectionStats() {
  return {
    labs: activeConnections.labs.size,
    delivery: activeConnections.delivery.size,
    doctors: activeConnections.doctors.size,
    total: activeConnections.labs.size + activeConnections.delivery.size + activeConnections.doctors.size
  };
}

module.exports = {
  initWebSocket,
  notifyNewOrder,
  getConnectionStats
};