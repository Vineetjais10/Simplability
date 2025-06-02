const express = require('express');
const { create, view, update, remove, index, me, updatePassword } = require('../controllers/users/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/permission.middleware');
const usersValidator = require('../validators/users.validator');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management API
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get list of users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter users by role name (e.g., Admin, User)
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
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter users by username.
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter users by email.
 *       - in: query
 *         name: phone_number
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter users by phone number.
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                   example: ""
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "dc2d947c-1df7-4d60-af44-d2841d138019"
 *                       name:
 *                         type: string
 *                         example: "Ramesh"
 *                       username:
 *                         type: string
 *                         example: "Ramesh020"
 *                       email:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       phone_number:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       profile_image:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-05T06:20:38.199Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-05T06:20:38.199Z"
 *                       Roles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "field_supervisor"
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 current_page:
 *                   type: integer
 *                   example: 1
 *                 total_pages:
 *                   type: integer
 *                   example: 10
 *                 error:
 *                   type: object
 *                   nullable: true
 *                   example: null
 */

router.get('', authenticate, authorize('user', 'read', ['admin', 'planner', 'field_manager']), index);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "+1234567890"
 *               profile_image:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               password:
 *                 type: string
 *                 example: "SecurePassword123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               address:
 *                  type: string
 *                  example: "123, Main Street, New York"
 *               role_ids:
 *                 type: array
 *                 example: ["8a7aab1a-b932-4d09-87f8-e4b95297dbf7"]
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: ""
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "8a7aab1a-b932-4d09-87f8-e4b95297dbf7"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     phone_number:
 *                       type: string
 *                       example: "+1234567890"
 *                     profile_image:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T12:50:19.798Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T12:50:19.798Z"
 *                 error:
 *                   type: object
 *                   nullable: true
 *                   example: null
 */
router.post('', authenticate, authorize('user', 'create', ['admin']), usersValidator.userValidation, create);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
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
 *                   example: ""
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "8a7aab1a-b932-4d09-87f8-e4b95297dbf7"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     phone_number:
 *                       type: string
 *                       example: "+1234567890"
 *                     profile_image:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T12:50:19.798Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T12:50:19.798Z"
 *                     Roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "field_supervisor"
 *                 error:
 *                   type: object
 *                   nullable: true
 *                   example: null
 */
router.get('/me', authenticate, me);

/**
 * @swagger
 * /api/v1/users/me/update-password:
 *   put:
 *     summary: Update user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The current password
 *                 example: "9876543210"
 *               new_password:
 *                 type: string
 *                 description: The new password
 *                 example: "abc@1234"
 *               confirm_password:
 *                 type: string
 *                 description: Confirm the new password
 *                 example: "abc@1234"
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: "Password updated successfully"
 *                 data:
 *                   type: object
 *                   description: Additional data (if any)
 *                   example: {}
 *                 error:
 *                   type: null
 *                   example: null
 *       401:
 *         description: Unauthorized access
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
 *                   example: ""
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "unauthorised"
 */
router.put('/me/update-password', authenticate, updatePassword);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
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
 *                   example: ""
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "dc2d947c-1df7-4d60-af44-d2841d138019"
 *                     name:
 *                       type: string
 *                       example: "Ramesh"
 *                     username:
 *                       type: string
 *                       example: "Ramesh020"
 *                     email:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     profile_image:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T06:20:38.199Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T06:20:38.199Z"
 *                     Roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "field_supervisor"
 *                 error:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
 */
router.get('/:id', authenticate, authorize('user', 'view', ['admin', 'planner']), view);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe_updated"
 *               email:
 *                 type: string
 *                 nullable: true
 *                 example: "john.doe.updated@example.com"
 *               phone_number:
 *                 type: string
 *                 nullable: true
 *                 example: "+1234567890"
 *               profile_image:
 *                 type: string
 *                 nullable: true
 *                 example: "https://example.com/path/to/updated-image.jpg"
 *               password:
 *                 type: string
 *                 example: "UpdatedPassword123"
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "dc2d947c-1df7-4d60-af44-d2841d138019"
 *                     name:
 *                       type: string
 *                       example: "John Doe Updated"
 *                     username:
 *                       type: string
 *                       example: "john_doe_updated"
 *                     email:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     phone_number:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     profile_image:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T06:20:38.199Z"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-12-05T13:11:10.147Z"
 *                     Roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "field_supervisor"
 *                 error:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
 */
router.patch('/:id', authenticate, authorize('user', 'update', ['admin', 'planner']), update);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
 */
router.delete('/:id', authenticate, authorize('user', 'delete', ['admin']), remove);

module.exports = router;
