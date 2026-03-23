const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'editorial_authority',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL Database: ' + (process.env.DB_NAME || 'editorial_authority'));
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failure:', err);
    });

module.exports = pool;
