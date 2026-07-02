const express = require('express');
const router = express.Router();
const controller = require('../controllers/team.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Team management is restricted to the 'admin' role only.
router.use(authenticate, requireAdmin);

router.get('/', controller.listTeam);
router.post('/', controller.createTeamMember);
router.patch('/:id', controller.updateTeamMember);
router.delete('/:id', controller.deleteTeamMember);

module.exports = router;
