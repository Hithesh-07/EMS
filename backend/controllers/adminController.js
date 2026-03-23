const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getDepartments = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM departments');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { dept_name, dept_code } = req.body;
        const [result] = await pool.query('INSERT INTO departments (dept_name, dept_code) VALUES (?, ?)', [dept_name, dept_code]);
        res.status(201).json({ success: true, data: { dept_id: result.insertId, dept_name, dept_code } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDesignations = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM designations');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDesignation = async (req, res) => {
    try {
        const { desig_name, grade } = req.body;
        const [result] = await pool.query('INSERT INTO designations (desig_name, grade) VALUES (?, ?)', [desig_name, grade]);
        res.status(201).json({ success: true, data: { desig_id: result.insertId, desig_name, grade } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getLocations = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM locations');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createLocation = async (req, res) => {
    try {
        const { loc_name, loc_code } = req.body;
        const [result] = await pool.query('INSERT INTO locations (loc_name, loc_code) VALUES (?, ?)', [loc_name, loc_code]);
        res.status(201).json({ success: true, data: { loc_id: result.insertId, loc_name, loc_code } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const [staff] = await pool.query("SELECT COUNT(*) as count FROM employees WHERE status = 'Active'");
        const [newJoin] = await pool.query("SELECT COUNT(*) as count FROM employees WHERE status = 'Active' AND MONTH(date_of_joining) = MONTH(CURRENT_DATE()) AND YEAR(date_of_joining) = YEAR(CURRENT_DATE())");
        const [depts] = await pool.query("SELECT COUNT(*) as count FROM departments");
        const [transfers] = await pool.query("SELECT COUNT(*) as count FROM employee_transfers WHERE status = 'Pending Approval'");

        res.json({
            success: true,
            data: {
                totalStaff: staff[0].count,
                newJoinees: newJoin[0].count,
                activeDepts: depts[0].count,
                pendingTransfers: transfers[0].count
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, name, email, role, created_at FROM users');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Hashing password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role]
        );

        res.status(201).json({ 
            success: true, 
            data: { user_id: result.insertId, name, email, role } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
