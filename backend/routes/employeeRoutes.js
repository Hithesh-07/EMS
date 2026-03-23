const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');
const { 
    getEmployees, createEmployee, getEmployeeById, 
    updateEmployee, getEmployeeTimeline, deleteEmployee
} = require('../controllers/employeeController');
const upload = require('../utils/multer');

const router = express.Router();

router.use(protect); // Need token

router.get('/', getEmployees);
router.post('/', authorize('Admin', 'HR Manager'), upload.single('photo'), auditLog('employees'), createEmployee);

router.get('/:emp_id', getEmployeeById);
router.put('/:emp_id', authorize('Admin', 'HR Manager'), upload.single('photo'), auditLog('employees'), updateEmployee);
router.delete('/:emp_id', authorize('Admin'), deleteEmployee);

router.get('/:emp_id/timeline', getEmployeeTimeline);

module.exports = router;
