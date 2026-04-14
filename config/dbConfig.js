const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL 🚀');

    } catch (err) {
        console.error('PostgreSQL connection error:', err);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };