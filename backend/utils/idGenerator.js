const pool = require('../config/db');

exports.generateEmpId = async (deptId) => {
    // 1. Get Dept Code
    const [deptRows] = await pool.query('SELECT dept_code FROM departments WHERE dept_id = ?', [deptId]);
    if (!deptRows.length) throw new Error('Invalid Department ID');
    const deptCode = deptRows[0].dept_code;

    // 2. Get Year
    const year = new Date().getFullYear();

    // 3. Find max sequence for this dept + year
    const prefix = `EMP-${deptCode}-${year}-`;
    const [employeeRows] = await pool.query(
        'SELECT emp_id FROM employees WHERE emp_id LIKE ? ORDER BY emp_id DESC LIMIT 1', 
        [`${prefix}%`]
    );

    let nextSeq = 1;
    if (employeeRows.length > 0) {
        const lastId = employeeRows[0].emp_id;
        const lastSeq = parseInt(lastId.split('-').pop(), 10);
        if (!isNaN(lastSeq)) {
            nextSeq = lastSeq + 1;
        }
    }

    // 4. Pad sequence to 4 digits
    const paddedSeq = String(nextSeq).padStart(4, '0');
    return `${prefix}${paddedSeq}`;
};
