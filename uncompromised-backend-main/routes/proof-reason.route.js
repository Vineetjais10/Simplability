const express = require('express');

const { index } = require('../controllers/proof-reasons/proof-reason.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/permission.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/v1/proof-reasons:
 *   get:
 *     summary: Get all proof reasons
 *     tags: [Proof Reason]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all Proof Reasons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProofReason'
 */
router.get('', authenticate, authorize('proof_reasons', 'index', ['admin', 'planner', 'field_supervisor']), index);

module.exports = router;
