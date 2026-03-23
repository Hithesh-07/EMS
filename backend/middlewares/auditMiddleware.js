const pool = require('../config/db');

const auditLog = (tableName) => {
    return async (req, res, next) => {
        // We want to capture the original send/json to log after successful response
        const originalSend = res.json;
        
        res.json = function (body) {
            res.json = originalSend;
            const responseBody = body;
            
            // Only log if successful and it's a mutation
            if (res.statusCode >= 200 && res.statusCode < 300) {
                if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
                    const userId = req.user ? req.user.user_id : null;
                    const actionType = req.method;
                    const recordId = req.params.emp_id || req.params.id || (responseBody.data ? responseBody.data.id : null) || 'UNKNOWN';
                    
                    const newValue = JSON.stringify(req.body || {});
                    const oldValue = JSON.stringify({}); // In a complete system, we might query the old value before change
                    
                    try {
                        pool.query(
                            'INSERT INTO audit_log (user_id, action_type, table_name, record_id, old_value, new_value) VALUES (?, ?, ?, ?, ?, ?)',
                            [userId, actionType, tableName, recordId, oldValue, newValue]
                        ).catch(err => console.error('Audit Log Error:', err));
                    } catch (e) {
                         console.error('Audit sync error:', e);
                    }
                }
            }
            return res.json(body);
        };
        
        next();
    };
};

module.exports = auditLog;
