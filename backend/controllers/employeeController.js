const pool = require('../config/db');
const { generateEmpId } = require('../utils/idGenerator');

// LIST EMPLOYEES
exports.getEmployees = async (req, res) => {
    try {
        const { dept, loc, status, search, page = 1, limit = 20 } = req.query;
        let query = `
            SELECT e.*, d.dept_name, des.desig_name, l.loc_name 
            FROM employees e
            LEFT JOIN departments d ON e.dept_id = d.dept_id
            LEFT JOIN designations des ON e.desig_id = des.desig_id
            LEFT JOIN locations l ON e.loc_id = l.loc_id
            WHERE 1=1
        `;
        const params = [];

        if (dept) { query += ' AND e.dept_id = ?'; params.push(dept); }
        if (loc) { query += ' AND e.loc_id = ?'; params.push(loc); }
        if (status) { query += ' AND e.status = ?'; params.push(status); }
        if (search) {
            query += ' AND (e.full_name LIKE ? OR e.emp_id LIKE ? OR e.email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY e.created_at DESC';

        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM employees e WHERE 1=1';
        const countParams = [...params.slice(0, params.length - 2)]; // Remove limit & offset
        if (dept) countQuery += ' AND e.dept_id = ?';
        if (loc) countQuery += ' AND e.loc_id = ?';
        if (status) countQuery += ' AND e.status = ?';
        if (search) countQuery += ' AND (e.full_name LIKE ? OR e.emp_id LIKE ? OR e.email LIKE ?)';

        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// CREATE EMPLOYEE
exports.createEmployee = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const data = req.body;

        const emp_id = await generateEmpId(data.dept_id);

        const empData = {
            emp_id, full_name: data.full_name, date_of_birth: data.date_of_birth,
            gender: data.gender, blood_group: data.blood_group, aadhaar_number: data.aadhaar_number,
            pan_number: data.pan_number, mobile: data.mobile, email: data.email,
            permanent_address: data.permanent_address, current_address: data.current_address,
            photo_url: data.photo_url || null, dept_id: data.dept_id, desig_id: data.desig_id,
            loc_id: data.loc_id, date_of_joining: data.date_of_joining, employment_type: data.employment_type,
            pf_applicable: data.pf_applicable || false, esi_applicable: data.esi_applicable || false,
            basic_pay: data.basic_pay, hra: data.hra || 0, da: data.da || 0, other_allowances: data.other_allowances || 0,
            bank_account_number: data.bank_account_number, ifsc_code: data.ifsc_code, status: 'Active'
        };

        const fields = Object.keys(empData);
        const values = Object.values(empData);
        const placeholders = fields.map(() => '?').join(', ');

        await connection.query(`INSERT INTO employees (${fields.join(', ')}) VALUES (${placeholders})`, values);

        if (data.nominees && data.nominees.length > 0) {
            for (let nom of data.nominees) {
                await connection.query(
                    'INSERT INTO nominees (emp_id, nominee_name, relationship, contact_number, address) VALUES (?, ?, ?, ?, ?)',
                    [emp_id, nom.nominee_name, nom.relationship, nom.contact_number, nom.address]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, data: { emp_id } });
    } catch (err) {
        await connection.rollback();
        // Validation constraint errors (duplicate pan/aadhaar)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(422).json({ success: false, message: 'Aadhaar or PAN already exists.' });
        }
        res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

// GET EMPLOYEE BY ID
exports.getEmployeeById = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const [empRows] = await pool.query(`
            SELECT e.*, d.dept_name, des.desig_name, l.loc_name 
            FROM employees e
            LEFT JOIN departments d ON e.dept_id = d.dept_id
            LEFT JOIN designations des ON e.desig_id = des.desig_id
            LEFT JOIN locations l ON e.loc_id = l.loc_id
            WHERE e.emp_id = ?`, [emp_id]);

        if (empRows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });

        const [nominees] = await pool.query('SELECT * FROM nominees WHERE emp_id = ?', [emp_id]);
        
        res.json({ success: true, data: { ...empRows[0], nominees } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
    try {
        const { emp_id } = req.params;

        // Check if Retired or Exited, or retirement initiated
        const [empRows] = await pool.query('SELECT status FROM employees WHERE emp_id = ?', [emp_id]);
        if (!empRows.length) return res.status(404).json({ success: false, message: 'Employee not found' });
        if (['Retired', 'Exited'].includes(empRows[0].status)) {
            return res.status(403).json({ success: false, message: 'Cannot update a Retired or Exited employee' });
        }

        const [exitRows] = await pool.query('SELECT status FROM employee_exit WHERE emp_id = ?', [emp_id]);
        if (exitRows.length > 0) {
            return res.status(403).json({ success: false, message: 'Employee retirement/exit has been initiated. Updates locked.' });
        }

        const updateData = req.body;
        // Basic fields that can be updated (excluding dept, desig, loc which happen via transfer)
        const allowedFields = ['full_name', 'mobile', 'email', 'permanent_address', 'current_address', 'photo_url', 'bank_account_number', 'ifsc_code', 'basic_pay', 'hra', 'da', 'other_allowances'];
        
        let updates = [];
        let params = [];
        
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                params.push(updateData[key]);
            }
        });

        if (updates.length > 0) {
            params.push(emp_id);
            await pool.query(`UPDATE employees SET ${updates.join(', ')} WHERE emp_id = ?`, params);
        }

        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET EMPLOYEE TIMELINE
exports.getEmployeeTimeline = async (req, res) => {
    try {
        const { emp_id } = req.params;
        
        const [empRows] = await pool.query(`
            SELECT e.date_of_joining, e.created_at, e.status, d.dept_name, des.desig_name, l.loc_name 
            FROM employees e
            LEFT JOIN departments d ON e.dept_id = d.dept_id
            LEFT JOIN designations des ON e.desig_id = des.desig_id
            LEFT JOIN locations l ON e.loc_id = l.loc_id
            WHERE e.emp_id = ?`, [emp_id]);

        if (!empRows.length) return res.status(404).json({ success: false, message: 'Employee not found' });
        const emp = empRows[0];

        let timeline = [];

        // Joining Event
        timeline.push({
            type: 'JOINED',
            date: emp.date_of_joining,
            dept: emp.dept_name,
            designation: emp.desig_name,
            location: emp.loc_name,
            reason: 'Initial Appointment'
        });

        // Transfers / Promotions
        const [transfers] = await pool.query(`
            SELECT t.*, d.dept_name as to_dept, des.desig_name as to_desig, l.loc_name as to_loc,
                   fd.dept_name as from_dept, fdes.desig_name as from_desig
            FROM employee_transfers t
            LEFT JOIN departments d ON t.to_dept_id = d.dept_id
            LEFT JOIN designations des ON t.to_desig_id = des.desig_id
            LEFT JOIN locations l ON t.to_loc_id = l.loc_id
            LEFT JOIN departments fd ON t.from_dept_id = fd.dept_id
            LEFT JOIN designations fdes ON t.from_desig_id = fdes.desig_id
            WHERE t.emp_id = ? AND t.status = 'Completed'
            ORDER BY t.transfer_date ASC`, [emp_id]);

        transfers.forEach(t => {
            let eventType = 'TRANSFERRED';
            if (t.from_desig_id !== t.to_desig_id) eventType = 'PROMOTED';
            
            timeline.push({
                type: eventType,
                date: t.transfer_date,
                dept: t.to_dept,
                designation: t.to_desig,
                location: t.to_loc,
                reason: t.reason,
                order_doc_url: t.order_doc_url,
                approved_by: t.approved_by,
                transfer_order_number: t.transfer_order_number
            });
        });

        // Current status or Exit
        if (['Retired', 'Exited'].includes(emp.status)) {
            const [exit] = await pool.query('SELECT * FROM employee_exit WHERE emp_id = ?', [emp_id]);
            if (exit.length > 0) {
                timeline.push({
                    type: 'EXITED',
                    date: exit[0].last_working_date,
                    reason: exit[0].retirement_type
                });
            }
        }

        res.json({ success: true, data: timeline });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
