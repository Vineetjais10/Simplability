const express = require('express');

const { create, update, index } = require('../controllers/farmtask-proofs/farmtask-proof.controller');
const { handleMulterError, uploadProofMedia } = require('../middlewares/multer.middleware');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/permission.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/v1/farm-task/proof:
 *   post:
 *     summary: Create a new farm task proof
 *     tags: [Farm Task Proof]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - farmtask_id
 *               - type
 *               - proof_media
 *             properties:
 *               farmtask_id:
 *                 type: string
 *                 description: ID of the farm task
 *                 example: "uuid"
 *               comments:
 *                 type: string
 *                 description: Comments related to the farm task
 *                 example: "Sample comment"
 *               type:
 *                 type: string
 *                 description: Status of the task (e.g., completed, not_completed)
 *                 example: "completed"
 *               proof_media:
 *                 type: string
 *                 format: binary
 *                 description: Media file (image) as proof for the farm task
 *     responses:
 *       201:
 *         description: Farm task proof created successfully
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
 *                   example: "Farm task proof created successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     farmTaskProof:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "uuid"
 *                         farmtask_id:
 *                           type: string
 *                           example: "uuid"
 *                         comments:
 *                           type: string
 *                           example: "Sample comment"
 *                         type:
 *                           type: string
 *                           example: "completed"
 *                     proofMedia:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           proof_id:
 *                             type: string
 *                             example: "uuid"
 *                           type:
 *                             type: string
 *                             example: "image/jpeg"
 *                           path:
 *                             type: string
 *                             example: "s3_url"
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
 *                   example: "Invalid farm task proof data"
 *       401:
 *         description: Unauthorized
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
 *                   example: "Unauthorized access"
 */

router.post('', authenticate, authorize('farmtask_proofs', 'create', ['admin', 'field_supervisor']), uploadProofMedia, handleMulterError, create);

/**
 * @swagger
 * /api/v1/farm-task/proof:
 *   get:
 *     summary: Retrieve farm task proofs
 *     tags: [Farm Task Proof]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: farmtask_id
 *         in: query
 *         description: The ID of the farm task
 *         required: true
 *         schema:
 *           type: string
 *           example: "uuid"
 *       - name: pagination[page]
 *         in: query
 *         description: The page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: pagination[limit]
 *         in: query
 *         description: The number of items per page for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved farm task proofs
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
 *                   example: "Farm task proofs retrieved successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "uuid"
 *                           farmtask_id:
 *                             type: string
 *                             example: "uuid"
 *                           comments:
 *                             type: string
 *                             example: "Sample comment"
 *                           type:
 *                             type: string
 *                             example: "completed"
 *                           proofMedia:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "uuid"
 *                                 type:
 *                                   type: string
 *                                   example: "image/jpeg"
 *                                 path:
 *                                   type: string
 *                                   example: "s3_url"
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     current_page:
 *                       type: integer
 *                       example: 1
 *                     total_pages:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Bad request - Missing required farmTaskId
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
 *                   example: "farmTaskId is required"
 *       401:
 *         description: Unauthorized
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
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
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
 *                   example: "Internal server error"
 */

router.get(
  '',
  authenticate,
  authorize('farmtask_proofs', 'view', ['admin', 'field_supervisor', 'planner']), // Add authorization roles if required
  index
);

/**
 * @swagger
 * /api/v1/farm-task/proof/{id}:
 *   patch:
 *     summary: Update farm task proof details
 *     tags: [Farm Task Proof]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier of the farm task proof
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 example: "Due to rain"
 *                 description: Comments related to the farm task
 *               type:
 *                 type: string
 *                 enum: [completed, not_completed, not_started]
 *                 example: "not_completed"
 *                 description: Status of the farm task
 *               proof_media:
 *                 type: string
 *                 format: binary
 *                 description: Image or video media file for the farm task proof
 *     responses:
 *       200:
 *         description: Farm task proof updated successfully
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
 *                   example: "Farm task proof updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: string
 *                       example: "Due to rain"
 *                     type:
 *                       type: string
 *                       example: "not_completed"
 *                     media_url:
 *                       type: string
 *                       example: "https://example.com/path/to/media-file.jpg"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T13:11:10.147Z"
 *       400:
 *         description: Bad request, invalid data provided
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
 *                   example: "Invalid input data"
 *       401:
 *         description: Unauthorized, invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Farm task not found
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
 *                   example: "Farm task not found"
 */

router.patch('/:id', authenticate, uploadProofMedia, handleMulterError, update);

module.exports = router;
