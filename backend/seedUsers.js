require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'editorial_authority',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        console.log('--- Starting User Seeding ---');

        const users = [
            { 
                name: 'Super Admin', 
                email: 'REPLACE_WITH_YOUR_EMAIL@example.com', // ✏️ CHANGE THIS
                password: 'REPLACE_WITH_YOUR_PASSWORD',      // ✏️ CHANGE THIS
                role: 'Admin' 
            },
            { 
                name: 'HR Manager', 
                email: 'manager@example.com', 
                password: 'manager123', 
                role: 'HR Manager' 
            }
        ];

        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            // Check if user exists
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [user.email]);
            
            if (rows.length === 0) {
                await pool.query(
                    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                    [user.name, user.email, hashedPassword, user.role]
                );
                console.log(`✅ Success: User [${user.role}] ${user.email} created.`);
            } else {
                console.log(`ℹ️ Warning: User ${user.email} already exists. Skipping.`);
            }
        }

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedUsers();
