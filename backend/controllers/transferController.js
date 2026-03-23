const pool = require('../config/db');

exports.getTransfers = async (req, res) => {
    try {
        const { emp_id, dept, loc, status } = req.query;
        let query = 'SELECT * FROM employee_transfers WHERE 1=1';
        let params = [];
        
        if (emp_id) { query += ' AND emp_id = ?'; params.push(emp_id); }
        if (dept) { query += ' AND (from_dept_id = ? OR to_dept_id = ?)'; params.push(dept, dept); }
        if (loc) {  query += ' AND (from_loc_id = ? OR to_loc_id = ?)'; params.push(loc, loc); }
        if (status) { query += ' AND status = ?'; params.push(status); }
        
        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.initiateTransfer = async (req, res) => {
    try {
        const { 
            emp_id, transfer_date, to_dept_id, to_desig_id, to_loc_id, 
            reason, remarks, transfer_order_number 
        } = req.body;

        // Fetch current records
        const [curr] = await pool.query('SELECT dept_id, desig_id, loc_id FROM employees WHERE emp_id = ?', [emp_id]);
        if (!curr.length) return res.status(404).json({ success: false, message: 'Employee not found' });
        
        await pool.query(
            `INSERT INTO employee_transfers 
            (emp_id, transfer_date, from_dept_id, to_dept_id, from_desig_id, to_desig_id, from_loc_id, to_loc_id, reason, remarks, transfer_order_number, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Initiated')`,
            [emp_id, transfer_date, curr[0].dept_id, to_dept_id, curr[0].desig_id, to_desig_id, curr[0].loc_id, to_loc_id, reason, remarks, transfer_order_number]
        );
        
        res.status(201).json({ success: true, message: 'Transfer Initiated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveTransfer = async (req, res) => {
    try {
        const { transfer_id } = req.params;
        await pool.query('UPDATE employee_transfers SET status = ?, approved_by = ? WHERE transfer_id = ?', 
            ['Approved', req.user.name, transfer_id]);
        res.json({ success: true, message: 'Transfer Approved' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.completeTransfer = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { transfer_id } = req.params;
        
        const [trans] = await connection.query('SELECT * FROM employee_transfers WHERE transfer_id = ?', [transfer_id]);
        if (!trans.length) throw new Error('Transfer not found');
        const t = trans[0];

        // 1. Update transfer status
        await connection.query('UPDATE employee_transfers SET status = ? WHERE transfer_id = ?', ['Completed', transfer_id]);
        
        // 2. Update employee master record
        await connection.query('UPDATE employees SET dept_id = ?, desig_id = ?, loc_id = ? WHERE emp_id = ?', 
            [t.to_dept_id, t.to_desig_id, t.to_loc_id, t.emp_id]);

        await connection.commit();
        res.json({ success: true, message: 'Transfer Completed and Master Record Updated' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

exports.getTransferHistory = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const [rows] = await pool.query('SELECT * FROM employee_transfers WHERE emp_id = ? ORDER BY transfer_date ASC', [emp_id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
