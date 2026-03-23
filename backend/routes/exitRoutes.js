const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');
const {
    getUpcomingRetirements, initiateRetirement, getExits,
    getExitChecklist, updateChecklistItem,
    getFnF, calculateAndCreateFnF, approveFnF
} = require('../controllers/exitController');

const router = express.Router();

router.use(protect);

router.get('/', getExits);
router.get('/upcoming', getUpcomingRetirements); // actually mapped under /api/retirement/upcoming in require
router.post('/initiate/:emp_id', authorize('HR Manager', 'Admin'), auditLog('employee_exit'), initiateRetirement);

router.get('/:emp_id/checklist', getExitChecklist);
router.put('/:emp_id/checklist/:checklist_id', auditLog('exit_checklist'), updateChecklistItem);

router.get('/:emp_id/fnf', getFnF);
router.post('/:emp_id/fnf', authorize('Accounts', 'Admin'), auditLog('fnf_settlement'), calculateAndCreateFnF);
router.put('/:emp_id/fnf/approve', authorize('Accounts', 'Admin'), auditLog('fnf_settlement'), approveFnF);

module.exports = router;
