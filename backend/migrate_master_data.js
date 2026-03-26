// Migration script - run once: node migrate_master_data.js
require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const migrate = async () => {
    console.log('Running Master Data migration...');
    const conn = await pool.getConnection();
    try {
        // 1. Update Departments
        await conn.query(`ALTER TABLE departments ADD COLUMN IF NOT EXISTS created_by INT`);
        await conn.query(`ALTER TABLE departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
        console.log('✅ Updated departments table');

        // 2. Update Designations
        await conn.query(`ALTER TABLE designations ADD COLUMN IF NOT EXISTS created_by INT`);
        await conn.query(`ALTER TABLE designations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
        console.log('✅ Updated designations table');

        // 3. Update Locations
        await conn.query(`ALTER TABLE locations ADD COLUMN IF NOT EXISTS created_by INT`);
        await conn.query(`ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
        console.log('✅ Updated locations table');

        // 4. Seed Super Admins
        const salt = await bcrypt.genSalt(10);
        
        // Admin 1: ao@kurnoolmilkunion.com
        const [existing1] = await conn.query('SELECT * FROM users WHERE email = ?', ['ao@kurnoolmilkunion.com']);
        if (existing1.length === 0) {
            const hash1 = await bcrypt.hash('ao123', salt);
            await conn.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                ['AO Super Admin', 'ao@kurnoolmilkunion.com', hash1, 'Admin']);
            console.log('✅ Seeded Super Admin: ao@kurnoolmilkunion.com');
        }

        // Admin 2: admin@kdmpmacultd.com
        const [existing2] = await conn.query('SELECT * FROM users WHERE email = ?', ['admin@kdmpmacultd.com']);
        if (existing2.length === 0) {
            const hash2 = await bcrypt.hash('admin123', salt);
            await conn.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                ['System Admin', 'admin@kdmpmacultd.com', hash2, 'Admin']);
            console.log('✅ Seeded Secondary Admin: admin@kdmpmacultd.com');
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
