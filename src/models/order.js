const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/dbConfig");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    UID: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    patientName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [2, 255],
      },
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    teethNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sex: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    screen: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    },

    price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },

    paid: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },

    lab_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    doc_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    prova: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    docReady: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    image: DataTypes.TEXT,
    image1: DataTypes.TEXT,
    image2: DataTypes.TEXT,
    file: DataTypes.TEXT,
    video: DataTypes.TEXT,
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;
