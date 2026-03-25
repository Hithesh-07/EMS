const express = require('express');
const { 
    getDepartments, createDepartment, updateDepartment, deleteDepartment, 
    getDesignations, createDesignation, updateDesignation, deleteDesignation, 
    getLocations, createLocation, updateLocation, deleteLocation,
    getDashboardStats, getUsers, createUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');

const router = express.Router();

router.use(protect); // All routes require auth

router.get('/departments', getDepartments);
router.post('/departments', authorize('Admin'), auditLog('departments'), createDepartment);
router.put('/departments/:id', authorize('Admin'), auditLog('departments'), updateDepartment);
router.delete('/departments/:id', authorize('Admin'), auditLog('departments'), deleteDepartment);

router.get('/designations', getDesignations);
router.post('/designations', authorize('Admin'), auditLog('designations'), createDesignation);
router.put('/designations/:id', authorize('Admin'), auditLog('designations'), updateDesignation);
router.delete('/designations/:id', authorize('Admin'), auditLog('designations'), deleteDesignation);

router.get('/locations', getLocations);
router.post('/locations', authorize('Admin'), auditLog('locations'), createLocation);
router.put('/locations/:id', authorize('Admin'), auditLog('locations'), updateLocation);
router.delete('/locations/:id', authorize('Admin'), auditLog('locations'), deleteLocation);

router.get('/dashboard', getDashboardStats);

router.get('/users', authorize('Admin'), getUsers);
router.post('/users', authorize('Admin'), auditLog('users'), createUser);

module.exports = router;
