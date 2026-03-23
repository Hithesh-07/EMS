const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');
const { 
    getEmployees, createEmployee, getEmployeeById, 
    updateEmployee, getEmployeeTimeline 
} = require('../controllers/employeeController');

const router = express.Router();

router.use(protect); // Need token

router.get('/', getEmployees);
router.post('/', authorize('Admin', 'HR Manager'), auditLog('employees'), createEmployee);

router.get('/:emp_id', getEmployeeById);
router.put('/:emp_id', authorize('Admin', 'HR Manager'), auditLog('employees'), updateEmployee);

router.get('/:emp_id/timeline', getEmployeeTimeline);

module.exports = router;
