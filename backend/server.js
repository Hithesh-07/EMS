require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const documentRoutes = require('./routes/documentRoutes');
const transferRoutes = require('./routes/transferRoutes');
const exitRoutes = require('./routes/exitRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { startMonthlyRetirementCron } = require('./services/cronService');

app.use('/api/auth', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/exit', exitRoutes);
app.use('/api/reports', reportRoutes); // Note: getUpcomingRetirements is at /api/exit/upcoming

// Start Cron Jobs
startMonthlyRetirementCron();

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'The Editorial Authority Backend is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
