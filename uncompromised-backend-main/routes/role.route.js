const express = require('express');
const { create, view, update, remove, index } = require('../controllers/roles/role.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/permission.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all tasks
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all Roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
router.get('', authenticate, authorize('role', 'read', ['admin', 'planner', 'field_supervisor']), index);

router.post('', authenticate, authorize('role', 'create', ['admin']), create);

router.get('/:id', authenticate, authorize('role', 'view', ['admin', 'planner', 'field_supervisor']), view);

router.put('/:id', authenticate, authorize('role', 'update', ['admin']), update);

router.delete('/:id', authenticate, authorize('role', 'delete', ['admin']), remove);

module.exports = router;
