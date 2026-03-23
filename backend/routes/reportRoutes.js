const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getReport } = require('../controllers/reportController');

const router = express.Router();

router.use(protect);

router.get('/:report_name', getReport);

module.exports = router;
