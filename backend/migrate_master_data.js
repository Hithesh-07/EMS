// Migration script - run once: node migrate_master_data.js
require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const migrate = async () => {
    console.log('Running Master Data migration...');
    const conn = await pool.getConnection();
    try {
        // 1. Update Departments
        await conn.query(`ALTER TABLE departments 
            ADD COLUMN IF NOT EXISTS created_by INT AFTER dept_code,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_by,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER created_at`);
        console.log('✅ Updated departments table');

        // 2. Update Designations
        await conn.query(`ALTER TABLE designations 
            ADD COLUMN IF NOT EXISTS created_by INT AFTER grade,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_by,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER created_at`);
        console.log('✅ Updated designations table');

        // 3. Update Locations
        await conn.query(`ALTER TABLE locations 
            ADD COLUMN IF NOT EXISTS created_by INT AFTER loc_code,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_by,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER created_at`);
        console.log('✅ Updated locations table');

        // 4. Seed New Super Admin
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('ao123', salt);
        
        const [existing] = await conn.query('SELECT * FROM users WHERE email = ?', ['ao@kurnoolmilkunion.com']);
        if (existing.length === 0) {
            await conn.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                ['AO Super Admin', 'ao@kurnoolmilkunion.com', hash, 'Admin']);
            console.log('✅ Seeded new Super Admin: ao@kurnoolmilkunion.com');
        } else {
            console.log('ℹ️ Super Admin already exists, skipping seed.');
        }

        console.log('\n🎉 Master Data migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration error:', err.message);
    } finally {
        conn.release();
        process.exit(0);
    }
};

migrate();
