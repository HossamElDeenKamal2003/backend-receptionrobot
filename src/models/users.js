// models/users.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/dbConfig');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    uid: {
        type: DataTypes.STRING,
        field: 'uid'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.TEXT
    },
    phone: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    buildno: {  // خلي بالك هنا build_no مش buildNo
        type: DataTypes.STRING(100),
        field: 'buildno'
    },
    floorno: {  // و هنا floor_no مش floorNo
        type: DataTypes.STRING(100),
        field: 'floorno'
    },
    address: {
        type: DataTypes.TEXT
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(50),
        defaultValue: 'user'
    },
    docsId: {
        type: DataTypes.TEXT,
        field: 'docsId'
    },
    labId: {
        type: DataTypes.TEXT,
        field: 'labId'
    },
    labContract: {
        type: DataTypes.TEXT,
        field: 'labContract'
    },
    delOrders: {
        type: DataTypes.TEXT,
        field: 'delOrders'
    },
    subscription: {
        type: DataTypes.STRING(100)
    },
    publicDelivery: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'publicDelivery'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    tableName: 'users',
    timestamps: false,  // لأننا بنستخدم created_at و updated_at يدوي
    underscored: false
});

module.exports = User;