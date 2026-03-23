const pool = require('../config/db');
const path = require('path');

// Helper: map user role to allowed audiences
const getAllowedAudiences = (role) => {
    if (role === 'Admin') return ['everyone', 'managers_admin', 'admin_only'];
    if (role === 'HR Manager' || role === 'Accounts') return ['everyone', 'managers_admin'];
    return ['everyone'];
};

// CREATE ANNOUNCEMENT (Admin only)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, audience, is_pinned } = req.body;
        if (!title || !audience) {
            return res.status(400).json({ success: false, message: 'Title and audience are required.' });
        }

        const file_url = req.file ? `/uploads/announcements/${req.file.filename}` : null;
        const file_name = req.file ? req.file.originalname : null;

        await pool.query(
            `INSERT INTO announcements (title, message, file_url, file_name, audience, is_pinned, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, message || null, file_url, file_name, audience, is_pinned === 'true' || is_pinned === true ? 1 : 0, req.user.id]
        );

        res.status(201).json({ success: true, message: 'Announcement posted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET ANNOUNCEMENTS (role-filtered, pinned first)
exports.getAnnouncements = async (req, res) => {
    try {
        const audiences = getAllowedAudiences(req.user.role);
        const placeholders = audiences.map(() => '?').join(', ');

        const [rows] = await pool.query(
            `SELECT a.*, u.name as posted_by_name,
                    EXISTS(SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id = a.announcement_id AND ar.user_id = ?) as is_read
             FROM announcements a
             LEFT JOIN users u ON a.posted_by = u.user_id
             WHERE a.audience IN (${placeholders})
             ORDER BY a.is_pinned DESC, a.created_at DESC
             LIMIT 50`,
            [req.user.id, ...audiences]
        );

        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET UNREAD COUNT
exports.getUnreadCount = async (req, res) => {
    try {
        const audiences = getAllowedAudiences(req.user.role);
        const placeholders = audiences.map(() => '?').join(', ');

        const [rows] = await pool.query(
            `SELECT COUNT(*) as count
             FROM announcements a
             WHERE a.audience IN (${placeholders})
             AND NOT EXISTS (SELECT 1 FROM announcement_reads ar WHERE ar.announcement_id = a.announcement_id AND ar.user_id = ?)`,
            [...audiences, req.user.id]
        );

        res.json({ success: true, count: rows[0].count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// MARK AS READ
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        // Insert ignore to avoid duplicate reads
        await pool.query(
            `INSERT IGNORE INTO announcement_reads (announcement_id, user_id) VALUES (?, ?)`,
            [id, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {
    try {
        const audiences = getAllowedAudiences(req.user.role);
        const placeholders = audiences.map(() => '?').join(', ');

        // Get IDs of all unread announcements for this user's audience
        const [unread] = await pool.query(
            `SELECT announcement_id FROM announcements WHERE audience IN (${placeholders})
             AND announcement_id NOT IN (SELECT announcement_id FROM announcement_reads WHERE user_id = ?)`,
            [...audiences, req.user.id]
        );

        if (unread.length > 0) {
            const readValues = unread.map(a => [a.announcement_id, req.user.id]);
            await pool.query(
                `INSERT IGNORE INTO announcement_reads (announcement_id, user_id) VALUES ?`,
                [readValues]
            );
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// TOGGLE PIN (Admin only)
exports.togglePin = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            `UPDATE announcements SET is_pinned = NOT is_pinned WHERE announcement_id = ?`,
            [id]
        );
        res.json({ success: true, message: 'Pin status toggled.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE ANNOUNCEMENT (Admin only)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM announcement_reads WHERE announcement_id = ?', [id]);
        await pool.query('DELETE FROM announcements WHERE announcement_id = ?', [id]);
        res.json({ success: true, message: 'Announcement deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET ALL ANNOUNCEMENTS (Admin management view, no filter)
exports.getAllAnnouncements = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT a.*, u.name as posted_by_name,
                    (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = a.announcement_id) as read_count
             FROM announcements a
             LEFT JOIN users u ON a.posted_by = u.user_id
             ORDER BY a.is_pinned DESC, a.created_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
