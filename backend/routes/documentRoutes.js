const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');
const {
    getDocuments, uploadDocument, verifyDocument,
    getMissingMandatory, downloadAll
} = require('../controllers/documentController');

// Multer placeholder setup
const multer = require('multer');
const upload = multer({ dest: 'uploads/temp/' }); // Usually configured better in prod

const router = express.Router();

router.use(protect);

router.get('/:emp_id', getDocuments);
router.post('/:emp_id/upload', upload.single('document'), auditLog('employee_documents'), uploadDocument);
router.put('/:doc_id/verify', authorize('Admin', 'HR Manager'), auditLog('employee_documents'), verifyDocument);

router.get('/:emp_id/missing-mandatory', getMissingMandatory);
router.get('/:emp_id/download-all', downloadAll);

module.exports = router;
