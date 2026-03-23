const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');
const {
    getTransfers, initiateTransfer, approveTransfer,
    completeTransfer, getTransferHistory
} = require('../controllers/transferController');

const router = express.Router();

router.use(protect);

router.get('/', getTransfers);
router.post('/', authorize('HR Manager', 'Admin'), auditLog('employee_transfers'), initiateTransfer);

router.put('/:transfer_id/approve', authorize('HR Manager', 'Admin'), auditLog('employee_transfers'), approveTransfer);
router.put('/:transfer_id/complete', authorize('Admin'), auditLog('employee_transfers'), completeTransfer);

router.get('/:emp_id/history', getTransferHistory);

module.exports = router;
