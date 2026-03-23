const pool = require('../config/db');

// Catch-all for basic reports
exports.getReport = async (req, res) => {
    try {
        const { report_name } = req.params;
        const format = req.query.format || 'json';

        // Very basic stubbing for required reports
        let query = '';
        let params = [];
        
        switch (report_name) {
            case 'employee-master':
                query = 'SELECT * FROM employees'; break;
            case 'department-count':
                query = 'SELECT d.dept_name, COUNT(e.emp_id) as count FROM departments d LEFT JOIN employees e ON d.dept_id = e.dept_id GROUP BY d.dept_id'; break;
            case 'new-joinings':
                query = 'SELECT * FROM employees WHERE MONTH(date_of_joining) = MONTH(CURDATE()) AND YEAR(date_of_joining) = YEAR(CURDATE())'; break;
            case 'esi-eligible':
                query = 'SELECT * FROM employees WHERE esi_applicable = 1'; break;
            case 'pf-enrolled':
                query = 'SELECT * FROM employees WHERE pf_applicable = 1'; break;
            default:
                return res.status(404).json({ success: false, message: 'Report not found' });
        }

        const [rows] = await pool.query(query, params);

        if (format === 'pdf') {
            return res.sendFile('mock_report.pdf', { root: './uploads' }); // Requires real PDFgen
        } else if (format === 'excel') {
            return res.sendFile('mock_report.xlsx', { root: './uploads' });
        }

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
