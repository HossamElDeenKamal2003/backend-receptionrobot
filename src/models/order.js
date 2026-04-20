const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/dbConfig");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,  // ✅ استخدام autoIncrement بدل UUIDV4
      primaryKey: true,
    },

    uid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'uid',
    },

    patient_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'patient_name',
      validate: {
        len: [2, 255],
      },
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'age',
    },

    teeth_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'teeth_no',
    },

    sex: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'sex',
    },

    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'color',
    },

    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'type',
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },

    screen: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'screen',
    },

    status: {
      type: DataTypes.ENUM(
        "DocReady(P)",
        "DocReady(F)",
        "OTW_LAB(P)",
        "OTW_LAB(F)",
        "UNDERWAY(P)",
        "UNDERWAY(F)",
        "LabReady(P)",
        "LabReady(F)",
        "OTW_DOC(P)",
        "OTW_DOC(F)",
        "END(P)",
        "END(F)"
      ),
      defaultValue: "DocReady(P)",
      field: 'status',
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'price',
    },

    paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'paid',
    },

    lab_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'lab_id',
    },

    doc_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'doc_id',
    },

    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'date',
    },

    prova: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'prova',
    },

    doc_ready: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'doc_ready',
    },

    image: {
      type: DataTypes.TEXT,
      field: 'image',
    },
    image1: {
      type: DataTypes.TEXT,
      field: 'image1',
    },
    image2: {
      type: DataTypes.TEXT,
      field: 'image2',
    },
    file: {
      type: DataTypes.TEXT,
      field: 'file',
    },
    video: {
      type: DataTypes.TEXT,
      field: 'video',
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;