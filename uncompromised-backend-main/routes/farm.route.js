const express = require('express');
const { uploadImage, handleMulterError } = require('../middlewares/multer.middleware');
const { create, view, update, remove, index } = require('../controllers/farms/farm.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/permission.middleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Farm
 *   description: Farm management API
 */

/**
 * @swagger
 * /api/v1/farms:
 *   get:
 *     summary: Get all farms
 *     tags: [Farm]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagination[limit]
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page.
 *       - in: query
 *         name: pagination[page]
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to retrieve.
 *     responses:
 *       200:
 *         description: List of all farms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Farms retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       name:
 *                         type: string
 *                         example: "Farm 1"
 *                       image_url:
 *                         type: string
 *                         example: "http://example.com/image.jpg"
 *                       address:
 *                         type: string
 *                         example: "123 Farm Road"
 *                       location:
 *                         type: string
 *                         example: "Location ABC"
 *                       plot:
 *                         type: string
 *                         example: "Plot 1"
 *       404:
 *         description: Farms not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Farms not found"
 */

/**
 * @swagger
 * /api/v1/farms:
 *   post:
 *     summary: Create a new farm
 *     tags: [Farm]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:  # Change content type to multipart/form-data
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the farm
 *                 example: "Farm 1"
 *               image_url:
 *                 type: string
 *                 description: Image Url
 *                 example: ""
 *               image:
 *                 type: string
 *                 format: binary  # Indicates a file upload
 *                 description: Image file for the farm
 *               address:
 *                 type: string
 *                 description: Address of the farm
 *                 example: "123 Farm Road"
 *               location:
 *                 type: string
 *                 description: Location of the farm
 *                 example: "Location ABC"
 *               plot:
 *                 type: string
 *                 description: Plot details
 *                 example: "Plot 1"
 *     responses:
 *       201:
 *         description: Farm created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Farm created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "Farm 1"
 *                     image_url:
 *                       type: string
 *                       example: "http://example.com/image.jpg"
 *                     address:
 *                       type: string
 *                       example: "123 Farm Road"
 *                     location:
 *                       type: string
 *                       example: "Location ABC"
 *                     plot:
 *                       type: string
 *                       example: "Plot 1"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid farm data"
 */

/**
 * @swagger
 * /api/v1/farms/{id}:
 *   get:
 *     summary: Get a farm by ID
 *     tags: [Farm]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The farm ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Farm details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "Farm 1"
 *                     image_url:
 *                       type: string
 *                       example: "http://example.com/image.jpg"
 *                     address:
 *                       type: string
 *                       example: "123 Farm Road"
 *                     location:
 *                       type: string
 *                       example: "Location ABC"
 *                     plot:
 *                       type: string
 *                       example: "Plot 1"
 *       404:
 *         description: Farm not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Farm not found"
 */

/**
 * @swagger
 * /api/v1/farms/{id}:
 *   patch:
 *     summary: Update a farm by ID
 *     tags: [Farm]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The farm ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Farm Name"
 *               image_url:
 *                 type: string
 *                 example: "http://example.com/new-image.jpg"
 *               image:
 *                 type: string
 *                 format: binary  # Indicates a file upload
 *                 description: Image file for the farm
 *               address:
 *                 type: string
 *                 example: "456 Farm Road"
 *               location:
 *                 type: string
 *                 example: "New Location"
 *               plot:
 *                 type: string
 *                 example: "Plot 2"
 *     responses:
 *       200:
 *         description: Farm updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Farm updated successfully"
 *       404:
 *         description: Farm not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Farm not found"
 */

/**
 * @swagger
 * /api/v1/farms/{id}:
 *   delete:
 *     summary: Delete a farm by ID
 *     tags: [Farm]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The farm ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Farm deleted successfully"
 *       404:
 *         description: Farm not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Farm not found"
 */

router.get('', authenticate, authorize('farm', 'read', ['admin', 'planner', 'field_supervisor']), index);

router.post('', authenticate, authorize('farm', 'create', ['admin']), uploadImage.single('image'), handleMulterError, create);

router.get('/:id', authenticate, authorize('farm', 'view', ['admin', 'planner', 'field_supervisor']), view);

router.patch('/:id', authenticate, authorize('farm', 'update', ['admin']), uploadImage.single('image'), handleMulterError, update);

router.delete('/:id', authenticate, authorize('farm', 'delete', ['admin']), remove);

module.exports = router;
