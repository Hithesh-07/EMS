const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getDepartments = async (req, res) => {
    try {
        const { activeOnly } = req.query;
        let query = 'SELECT * FROM departments';
        if (activeOnly === 'true') {
            query += ' WHERE is_active = TRUE';
        }
        const [rows] = await pool.query(query);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { dept_name, dept_code } = req.body;
        const created_by = req.user.user_id;
        const [result] = await pool.query('INSERT INTO departments (dept_name, dept_code, created_by) VALUES (?, ?, ?)', [dept_name, dept_code, created_by]);
        res.status(201).json({ success: true, data: { dept_id: result.insertId, dept_name, dept_code } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { dept_name, dept_code, is_active } = req.body;
        await pool.query('UPDATE departments SET dept_name = ?, dept_code = ?, is_active = ? WHERE dept_id = ?', 
            [dept_name, dept_code, is_active, id]);
        res.json({ success: true, message: 'Department updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        // Check for active employees
        const [employees] = await pool.query("SELECT COUNT(*) as count FROM employees WHERE dept_id = ? AND status != 'Deleted'", [id]);
        if (employees[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete — ${employees[0].count} active employees are in this department. Deactivate it instead.` 
            });
        }
        await pool.query('DELETE FROM departments WHERE dept_id = ?', [id]);
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDesignations = async (req, res) => {
    try {
        const { activeOnly } = req.query;
        let query = 'SELECT * FROM designations';
        if (activeOnly === 'true') {
            query += ' WHERE is_active = TRUE';
        }
        const [rows] = await pool.query(query);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createDesignation = async (req, res) => {
    try {
        const { desig_name, grade } = req.body;
        const created_by = req.user.user_id;
        const [result] = await pool.query('INSERT INTO designations (desig_name, grade, created_by) VALUES (?, ?, ?)', [desig_name, grade, created_by]);
        res.status(201).json({ success: true, data: { desig_id: result.insertId, desig_name, grade } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const { desig_name, grade, is_active } = req.body;
        await pool.query('UPDATE designations SET desig_name = ?, grade = ?, is_active = ? WHERE desig_id = ?', 
            [desig_name, grade, is_active, id]);
        res.json({ success: true, message: 'Designation updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDesignation = async (req, res) => {
    try {
        const { id } = req.params;
        const [employees] = await pool.query("SELECT COUNT(*) as count FROM employees WHERE desig_id = ? AND status != 'Deleted'", [id]);
        if (employees[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete — ${employees[0].count} active employees have this designation. Deactivate it instead.` 
            });
        }
        await pool.query('DELETE FROM designations WHERE desig_id = ?', [id]);
        res.json({ success: true, message: 'Designation deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getLocations = async (req, res) => {
    try {
        const { activeOnly } = req.query;
        let query = 'SELECT * FROM locations';
        if (activeOnly === 'true') {
            query += ' WHERE is_active = TRUE';
        }
        const [rows] = await pool.query(query);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createLocation = async (req, res) => {
    try {
        const { loc_name, loc_code } = req.body;
        const created_by = req.user.user_id;
        const [result] = await pool.query('INSERT INTO locations (loc_name, loc_code, created_by) VALUES (?, ?, ?)', [loc_name, loc_code, created_by]);
        res.status(201).json({ success: true, data: { loc_id: result.insertId, loc_name, loc_code } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { loc_name, loc_code, is_active } = req.body;
        await pool.query('UPDATE locations SET loc_name = ?, loc_code = ?, is_active = ? WHERE loc_id = ?', 
            [loc_name, loc_code, is_active, id]);
        res.json({ success: true, message: 'Location updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const [employees] = await pool.query("SELECT COUNT(*) as count FROM employees WHERE loc_id = ? AND status != 'Deleted'", [id]);
        if (employees[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete — ${employees[0].count} active employees are at this location. Deactivate it instead.` 
            });
        }
        await pool.query('DELETE FROM locations WHERE loc_id = ?', [id]);
        res.json({ success: true, message: 'Location deleted successfully' });
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
