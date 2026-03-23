// Migration script - run once: node migrate.js
require('dotenv').config();
const pool = require('./config/db');

const migrate = async () => {
    console.log('Running database migration...');
    const conn = await pool.getConnection();
    try {
        // 1. Add 'Deleted' to employees status enum
        await conn.query(`ALTER TABLE employees MODIFY COLUMN status ENUM('Active', 'Inactive', 'Retired', 'Exited', 'Deleted') DEFAULT 'Active'`);
        console.log('✅ Updated employees.status ENUM');

        // 2. Create announcements table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                announcement_id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                file_url VARCHAR(500),
                file_name VARCHAR(255),
                audience ENUM('everyone', 'managers_admin', 'admin_only') NOT NULL DEFAULT 'everyone',
                is_pinned BOOLEAN DEFAULT FALSE,
                posted_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Created announcements table');

        // 3. Create announcement_reads table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS announcement_reads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                announcement_id INT NOT NULL,
                user_id INT NOT NULL,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_read (announcement_id, user_id),
                FOREIGN KEY (announcement_id) REFERENCES announcements(announcement_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created announcement_reads table');

        console.log('\n🎉 Migration completed successfully!');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate key name') || err.message.includes("already exists")) {
            console.log('ℹ️  Tables already exist, skipping.');
        } else {
            console.error('❌ Migration error:', err.message);
        }
    } finally {
        conn.release();
        process.exit(0);
    }
};

migrate();
