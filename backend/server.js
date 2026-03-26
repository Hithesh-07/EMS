require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const documentRoutes = require('./routes/documentRoutes');
const transferRoutes = require('./routes/transferRoutes');
const exitRoutes = require('./routes/exitRoutes');
const reportRoutes = require('./routes/reportRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const { startMonthlyRetirementCron } = require('./services/cronService');
const pool = require('./config/db');

// --- Start MySQL Auto-Migrations ---
const runMigrations = async () => {
  try {
    await pool.query(`
      ALTER TABLE departments 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS created_by INT;
    `);
    await pool.query(`
      ALTER TABLE designations
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS created_by INT;
    `);
    await pool.query(`
      ALTER TABLE locations
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS created_by INT;
    `);
    await pool.query(`
      UPDATE departments SET is_active = 1 WHERE is_active IS NULL
    `);
    await pool.query(`
      UPDATE designations SET is_active = 1 WHERE is_active IS NULL
    `);
    await pool.query(`
      UPDATE locations SET is_active = 1 WHERE is_active IS NULL
    `);
    console.log('✅ MySQL Migrations applied successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
};
runMigrations();

app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/exit', exitRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);

// --- Production Frontend Serving ---
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
    // Serve static files from the frontend/dist folder
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Catch-all route to serve index.html for React Router
    app.get('*', (req, res) => {
        // If it starts with /api, it's a 404 for the API
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ success: false, message: 'API Route Not Found' });
        }
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

// Start Cron Jobs
startMonthlyRetirementCron();

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'The Editorial Authority Backend is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
