// routes/crop.route.js

const express = require('express');
const { create, index, view, update, remove } = require('../controllers/crops/crop.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/permission.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Crop
 *   description: Crop management endpoints
 */

/**
 * @swagger
 * /api/v1/crops:
 *   get:
 *     summary: Get all crops
 *     tags: [Crop]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all crops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Crop'
 *   post:
 *     summary: Create a new crop
 *     tags: [Crop]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Crop created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Crop'
 */

router.get('', authenticate, authorize('crop', 'read', ['admin', 'planner', 'field_supervisor']), index);

router.post('', authenticate, authorize('crop', 'create', ['admin']), create);

/**
 * @swagger
 * /api/v1/crops/{id}:
 *   get:
 *     summary: Get a crop by ID
 *     tags: [Crop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Crop data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Crop'
 *       404:
 *         description: Crop not found
 *   patch:
 *     summary: Update a crop by ID
 *     tags: [Crop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Crop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Crop'
 *       404:
 *         description: Crop not found
 *   delete:
 *     summary: Delete a crop by ID
 *     tags: [Crop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Crop deleted successfully
 *       404:
 *         description: Crop not found
 */

router.get('/:id', authenticate, authorize('crop', 'view', ['admin', 'planner', 'field_supervisor']), view);

router.patch('/:id', authenticate, authorize('crop', 'update', ['admin']), update);

router.delete('/:id', authenticate, authorize('crop', 'delete', ['admin']), remove);

module.exports = router;
