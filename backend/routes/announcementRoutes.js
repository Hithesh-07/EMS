const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../utils/multer');
const {
    createAnnouncement, getAnnouncements, getUnreadCount,
    markAsRead, markAllAsRead, togglePin,
    deleteAnnouncement, getAllAnnouncements
} = require('../controllers/announcementController');

const router = express.Router();
router.use(protect);

router.get('/unread-count', getUnreadCount);
router.get('/all', authorize('Admin'), getAllAnnouncements);
router.get('/', getAnnouncements);
router.post('/', authorize('Admin'), upload.single('file'), createAnnouncement);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/pin', authorize('Admin'), togglePin);
router.delete('/:id', authorize('Admin'), deleteAnnouncement);

module.exports = router;
