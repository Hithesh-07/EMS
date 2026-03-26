const pool = require('../config/db');

exports.getUpcomingRetirements = async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = `
            SELECT e.emp_id, e.full_name, d.dept_name, des.desig_name, l.loc_name, 
                   e.date_of_birth, DATE_ADD(e.date_of_birth, INTERVAL 58 YEAR) as retirement_date,
                   e.date_of_joining, TIMESTAMPDIFF(YEAR, e.date_of_joining, CURDATE()) as total_years_service
            FROM employees e
            LEFT JOIN departments d ON e.dept_id = d.dept_id
            LEFT JOIN designations des ON e.desig_id = des.desig_id
            LEFT JOIN locations l ON e.loc_id = l.loc_id
            WHERE e.status = 'Active'
        `;
        let params = [];

        if (month && year) {
            query += ` AND MONTH(DATE_ADD(e.date_of_birth, INTERVAL 58 YEAR)) = ? 
                       AND YEAR(DATE_ADD(e.date_of_birth, INTERVAL 58 YEAR)) = ?`;
            params.push(month, year);
        } else {
            // Default: this month
            query += ` AND MONTH(DATE_ADD(e.date_of_birth, INTERVAL 58 YEAR)) = MONTH(CURDATE())
                       AND YEAR(DATE_ADD(e.date_of_birth, INTERVAL 58 YEAR)) = YEAR(CURDATE())`;
        }
        
        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getExits = async (req, res) => {
    try {
        const query = `
            SELECT ex.*, e.full_name, d.dept_name, des.desig_name
            FROM employee_exit ex
            JOIN employees e ON ex.emp_id = e.emp_id
            LEFT JOIN departments d ON e.dept_id = d.dept_id
            LEFT JOIN designations des ON e.desig_id = des.desig_id
            ORDER BY ex.initiated_date DESC
        `;
        const [rows] = await pool.query(query);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.initiateRetirement = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { emp_id } = req.params;
        const { retirement_type, last_working_date } = req.body; // e.g., 'Superannuation'

        await connection.query(
            'INSERT INTO employee_exit (emp_id, last_working_date, retirement_type, approved_by, status) VALUES (?, ?, ?, ?, ?)',
            [emp_id, last_working_date, retirement_type, req.user.name, 'Initiated']
        );

        // Pre-fill exit checklist
        const items = ['Laptop Returned', 'ID Card Surrendered', 'NOC from Department Head', 'Accounts Clearance', 'IT Access Revoked', 'Email Deactivated'];
        for (let item of items) {
            await connection.query('INSERT INTO exit_checklist (emp_id, item_name, status) VALUES (?, ?, ?)', [emp_id, item, 'Pending']);
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Retirement initiated and locked for edits.' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

exports.getExitChecklist = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const [rows] = await pool.query('SELECT * FROM exit_checklist WHERE emp_id = ?', [emp_id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateChecklistItem = async (req, res) => {
    try {
        const { emp_id, checklist_id } = req.params;
        const { status } = req.body; // 'Done' or 'Pending'
        
        await pool.query(
            'UPDATE exit_checklist SET status = ?, completed_by = ?, completed_date = NOW() WHERE checklist_id = ? AND emp_id = ?',
            [status, status === 'Done' ? req.user.name : null, checklist_id, emp_id]
        );
        res.json({ success: true, message: 'Checklist updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getFnF = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const [rows] = await pool.query('SELECT * FROM fnf_settlement WHERE emp_id = ?', [emp_id]);
        res.json({ success: true, data: rows.length > 0 ? rows[0] : null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.calculateAndCreateFnF = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const { payment_mode, payment_date } = req.body;
        
        // Fetch employment details
        const [empRows] = await pool.query('SELECT basic_pay, date_of_joining FROM employees WHERE emp_id = ?', [emp_id]);
        const [exitRows] = await pool.query('SELECT retirement_type FROM employee_exit WHERE emp_id = ?', [emp_id]);
        
        if (!empRows.length || !exitRows.length) return res.status(404).json({ success: false, message: 'Data missing' });
        
        const emp = empRows[0];
        const retireType = exitRows[0].retirement_type;
        
        // Calculate years
        const joinDate = new Date(emp.date_of_joining);
        const exitDate = new Date(); // Or last_working_date
        const diffTime = Math.abs(exitDate - joinDate);
        const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));

        let gratuity = 0;
        if (diffYears >= 5 || retireType === 'Death in Service') {
            gratuity = (emp.basic_pay * 15 / 26) * diffYears;
            if (gratuity > 2000000) gratuity = 2000000;
        }

        // Placeholder values for components to be integrated with a full Payroll/Attendance module
        const leave_encashment = 0;
        const pf_settlement = 0;
        const esi_settlement = 0;
        const loan_recovery = 0;
        const advance_adjustment = 0;
        const other_deductions = 0;

        const totalEarn = gratuity + leave_encashment + pf_settlement + esi_settlement;
        const totalDeduct = loan_recovery + advance_adjustment + other_deductions;
        const net_payable = totalEarn - totalDeduct;

        // Check if exists
        const [existing] = await pool.query('SELECT fnf_id FROM fnf_settlement WHERE emp_id = ?', [emp_id]);
        if (existing.length > 0) {
            await pool.query(
                `UPDATE fnf_settlement SET gratuity_amount=?, leave_encashment=?, pf_settlement=?, esi_settlement=?, loan_recovery=?, advance_adjustment=?, other_deductions=?, net_payable=?, payment_mode=?, payment_date=?, status='Pending' WHERE emp_id=?`,
                [gratuity, leave_encashment, pf_settlement, esi_settlement, loan_recovery, advance_adjustment, other_deductions, net_payable, payment_mode, payment_date, emp_id]
            );
        } else {
            await pool.query(
                `INSERT INTO fnf_settlement (emp_id, gratuity_amount, leave_encashment, pf_settlement, esi_settlement, loan_recovery, advance_adjustment, other_deductions, net_payable, payment_mode, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
                [emp_id, gratuity, leave_encashment, pf_settlement, esi_settlement, loan_recovery, advance_adjustment, other_deductions, net_payable, payment_mode, payment_date]
            );
        }

        res.status(201).json({ success: true, message: 'FnF Calculated and Saved' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveFnF = async (req, res) => {
    try {
        const { emp_id } = req.params;
        
        // 1. Check checklist
        const [checklist] = await pool.query('SELECT status FROM exit_checklist WHERE emp_id = ?', [emp_id]);
        const allDone = checklist.every(item => item.status === 'Done');
        
        if (!allDone) {
            return res.status(400).json({ success: false, message: 'Exit checklist is not 100% complete' });
        }
        
        // 2. Approve
        await pool.query('UPDATE fnf_settlement SET status = ?, approved_by = ? WHERE emp_id = ?', ['Approved', req.user.name, emp_id]);
        
        // 3. Mark employee as Exited/Retired
        const [exitRec] = await pool.query('SELECT retirement_type FROM employee_exit WHERE emp_id = ?', [emp_id]);
        const finalStatus = exitRec[0].retirement_type === 'Resignation' ? 'Exited' : 'Retired';
        
        await pool.query('UPDATE employees SET status = ? WHERE emp_id = ?', [finalStatus, emp_id]);
        await pool.query('UPDATE employee_exit SET status = ? WHERE emp_id = ?', ['Completed', emp_id]);

        res.json({ success: true, message: 'FnF Approved and Employee marked as ' + finalStatus });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
