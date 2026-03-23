const express = require('express');
const { 
    getDepartments, createDepartment, 
    getDesignations, createDesignation, 
    getLocations, createLocation,
    getDashboardStats, getUsers, createUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');

const router = express.Router();

router.use(protect); // All routes require auth

router.get('/departments', getDepartments);
router.post('/departments', authorize('Admin'), auditLog('departments'), createDepartment);

router.get('/designations', getDesignations);
router.post('/designations', authorize('Admin'), auditLog('designations'), createDesignation);

router.get('/locations', getLocations);
router.post('/locations', authorize('Admin'), auditLog('locations'), createLocation);

router.get('/dashboard', getDashboardStats);

router.get('/users', authorize('Admin'), getUsers);
router.post('/users', authorize('Admin'), auditLog('users'), createUser);

module.exports = router;
