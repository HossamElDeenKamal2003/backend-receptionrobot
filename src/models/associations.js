const User = require('./users');
const Order = require('./order');

// الطبيب
Order.belongsTo(User, {
    foreignKey: 'doc_id',
    as: 'doctor'
});

User.hasMany(Order, {
    foreignKey: 'doc_id',
    as: 'doctorOrders'
});

// المعمل
Order.belongsTo(User, {
    foreignKey: 'lab_id',
    as: 'lab'
});

User.hasMany(Order, {
    foreignKey: 'lab_id',
    as: 'labOrders'
});

module.exports = {
    User,
    Order
};