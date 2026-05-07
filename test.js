const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    "1234",
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database is connected successfully');
    } catch (err) {
        console.error('❌ DB connection failed:', err);
    } finally {
        await sequelize.close();
    }
})();
