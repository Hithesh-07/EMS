const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getDocuments = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const [docs] = await pool.query('SELECT * FROM employee_documents WHERE emp_id = ? ORDER BY upload_date DESC', [emp_id]);
        res.json({ success: true, data: docs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const { doc_type, remarks } = req.body;
        
        // Mocking file upload path logic since we don't have multer fully configured here
        const file_url = req.file ? `/uploads/documents/${emp_id}/${req.file.filename}` : `/uploads/documents/${emp_id}/mock_file.pdf`;
        
        // Check for existing document of same type
        const [existing] = await pool.query(
            'SELECT version_number FROM employee_documents WHERE emp_id = ? AND doc_type = ? ORDER BY version_number DESC LIMIT 1',
            [emp_id, doc_type]
        );

        const version_number = existing.length > 0 ? existing[0].version_number + 1 : 1;
        
        await pool.query(
            'INSERT INTO employee_documents (emp_id, doc_type, file_url, uploaded_by, verification_status, remarks, version_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [emp_id, doc_type, file_url, req.user.user_id, 'Pending', remarks, version_number]
        );
        
        res.status(201).json({ success: true, message: 'Document uploaded successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyDocument = async (req, res) => {
    try {
        const { doc_id } = req.params;
        const { verification_status, remarks } = req.body; // 'Verified', 'Rejected'
        
        await pool.query(
            'UPDATE employee_documents SET verification_status = ?, remarks = ? WHERE doc_id = ?',
            [verification_status, remarks, doc_id]
        );
        res.json({ success: true, message: `Document marked as ${verification_status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getMissingMandatory = async (req, res) => {
    try {
        const { emp_id } = req.params;
        const mandatory = ['Aadhaar Card', 'PAN Card', 'Bank Passbook', 'Joining Order'];
        
        const [docs] = await pool.query(
            `SELECT doc_type, verification_status 
             FROM employee_documents 
             WHERE emp_id = ? AND doc_type IN (?)
             ORDER BY version_number DESC`, // Simplification: doesn't strictly group by max version but serves idea
            [emp_id, mandatory]
        );

        let missing = [];
        mandatory.forEach(mDoc => {
            const found = docs.find(d => d.doc_type === mDoc);
            if (!found || found.verification_status !== 'Verified') {
                missing.push(mDoc);
            }
        });

        res.json({ success: true, data: missing });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.downloadAll = async (req, res) => {
    // In a real app we'd spawn a process to zip files using something like `archiver`
    res.json({ success: true, message: 'ZIP download initiated (mocked hook)' });
};
