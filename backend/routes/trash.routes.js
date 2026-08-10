const express = require('express');
const router = express.Router();
const controller = require('../controllers/trash.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Recycle Bin spans every module (including team members and customers), so it's admin-only.
router.use(authenticate, requireAdmin);

router.get('/', controller.listTrash);
router.delete('/empty', controller.emptyTrash);
router.post('/:type/:id/restore', controller.restoreItem);
router.delete('/:type/:id', controller.permanentlyDeleteItem);

module.exports = router;
