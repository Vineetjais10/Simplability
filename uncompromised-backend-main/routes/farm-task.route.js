const express = require('express');
const { create, createOrUpdate, index, getStatus, view, remove, update, getFilters } = require('../controllers/farms-tasks/farm-task.controller');
const { upload, handleMulterError } = require('../middlewares/multer.middleware');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/permission.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/v1/farms/tasks/upload-csv:
 *   post:
 *     summary: Uploads a CSV file to process farm tasks.
 *     description: Upload a CSV file, save it to an S3 bucket, validate its contents, and create entries in `farms_tasks`. After processing, an output file is uploaded to S3, and a download URL is returned.
 *     tags:
 *       - Farm Task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The CSV file to upload.
 *     responses:
 *       200:
 *         description: File processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadUrl:
 *                   type: string
 *                   description: URL to download the processed file.
 *       400:
 *         description: Bad request, possibly due to missing file or coulmn name validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Description of the validation error, such as missing or unexpected columns.
 *             example:
 *                error: "Column name validation failed. Missing columns: Farm Location. Unexpected columns: Extra Column Name."
 *       500:
 *         description: Server error, possibly due to file processing or S3 upload failure.
 */
router.post(
  '/upload-csv',
  authenticate,
  authorize('farm_task', 'upload_csv', ['admin', 'planner', 'field_manager']),
  upload.single('file'),
  handleMulterError,
  createOrUpdate
);

/**
 * @swagger
 * /api/v1/farms/tasks:
 *   get:
 *     summary: Retrieve farm tasks with filtering, sorting, and pagination.
 *     description: Fetch a list of farm tasks with filtering, sorting, and pagination options.
 *     tags:
 *       - Farm Task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farm
 *         schema:
 *           type: string
 *         description: Filter by farm name.
 *       - in: query
 *         name: assigned_at
 *         schema:
 *           type: string
 *           example: '{"start":"2023-01-01","end":"2023-12-31"}'
 *         description: Filter by assigned date range in JSON format.
 *       - in: query
 *         name: task
 *         schema:
 *           type: string
 *         description: Filter by task name.
 *       - in: query
 *         name: field_supervisor
 *         schema:
 *           type: string
 *         description: Filter by field supervisor name.
 *       - in: query
 *         name: field_supervisor_username
 *         schema:
 *           type: string
 *         description: Filter by field supervisor usernamename.
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [critical, moderate, normal]
 *         description: Filter by task priority.
 *       - in: query
 *         name: crop
 *         schema:
 *           type: string
 *         description: Filter by crop name.
 *       - in: query
 *         name: task_status
 *         schema:
 *           type: string
 *           enum: [completed, not_started]
 *         description: Filter by task status.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Filter by task state.
 *       - in: query
 *         name: sorting[column]
 *         schema:
 *           type: string
 *           enum: [farm, task, crop, user, assigned_at]
 *         description: Column to sort by.
 *       - in: query
 *         name: sorting[direction]
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort direction.
 *       - in: query
 *         name: pagination[limit]
 *         schema:
 *           type: integer
 *         description: Number of records per page.
 *       - in: query
 *         name: pagination[page]
 *         schema:
 *           type: integer
 *         description: Page number to retrieve.
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [download]
 *         description: If set to "download", the API will return the data as an Excel file instead of paginated JSON data.
 *     responses:
 *       200:
 *         description: Successfully retrieved farm tasks, or downloaded the data as an Excel file.
 *       400:
 *         description: Invalid request parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('', authenticate, authorize('farm_task', 'read', ['admin', 'planner', 'field_supervisor', 'field_manager']), index);

/**
 * @swagger
 * /api/v1/farms/tasks/filters:
 *   get:
 *     summary: Retrieve filters for farm tasks and related entities.
 *     description: Fetch filters such as field supervisors, farms, crops, tasks, and roles for use in farm task management.
 *     tags:
 *       - Farm Task
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved filters.
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
 *                     field_supervisors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "4185854d-1658-4624-9ce5-f04b58c4d8b0"
 *                           name:
 *                             type: string
 *                             example: "Farmer"
 *                           username:
 *                             type: string
 *                             example: "farmer"
 *                     farms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "db3c37d7-a861-46f4-9d6f-c0eb65924d1e"
 *                           name:
 *                             type: string
 *                             example: "red current 3"
 *                     crops:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "9bdf18b8-9d61-45b2-92eb-395b0640a07c"
 *                           name:
 *                             type: string
 *                             example: "Rice"
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "828f5c49-0f2c-413c-8107-18185e0dd2be"
 *                           name:
 *                             type: string
 *                             example: "Field Preparation"
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "ef5e042f-bcf3-4b89-9ea1-070a1d339fa2"
 *                           name:
 *                             type: string
 *                             example: "field_supervisor"
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       401:
 *         description: Unauthorized. User is not authenticated.
 *       403:
 *         description: Forbidden. User does not have the required permissions.
 *       500:
 *         description: Internal server error.
 */
router.get('/filters', authenticate, authorize('farm_task', 'read', ['admin', 'planner', 'field_supervisor', 'field_manager']), getFilters);

/**
 * @swagger
 * /api/v1/farms/tasks:
 *   post:
 *     summary: Create a new farm task
 *     description: Creates a new farm task entry with the provided details.
 *     tags:
 *       - Farm Task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farm_id:
 *                 type: string
 *                 description: ID of the farm.
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               task_id:
 *                 type: string
 *                 description: ID of the task.
 *                 example: "234e5678-e89b-12d3-a456-426614174001"
 *               user_id:
 *                 type: string
 *                 description: ID of the user assigned to the task.
 *                 example: "345e6789-e89b-12d3-a456-426614174002"
 *               crop_id:
 *                 type: string
 *                 description: ID of the crop.
 *                 example: "456e7890-e89b-12d3-a456-426614174003"
 *               assigned_at:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time when the task is assigned.
 *                 example: "2024-11-20T10:00:00Z"
 *               instructions:
 *                 type: string
 *                 description: Additional instructions for the task.
 *                 example: "Water the crops every morning."
 *               remarks:
 *                 type: string
 *                 description: Additional remarks about the task.
 *                 example: "High priority due to upcoming inspection."
 *               priority:
 *                 type: string
 *                 enum: [critical, moderate, normal]
 *                 description: Priority of the task (Critical, Moderate, Normal).
 *                 example: "normal"
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Status of the task.
 *                 example: "published"
 *               task_status:
 *                 type: string
 *                 enum: [not_started, completed]
 *                 description: Current status of the task.
 *                 example: "not_started"
 *     responses:
 *       201:
 *         description: Farm task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the newly created farm task.
 *                   example: "567e8901-e89b-12d3-a456-426614174004"
 *                 farm_id:
 *                   type: string
 *                   description: The ID of the associated farm.
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 task_id:
 *                   type: string
 *                   description: The ID of the associated task.
 *                   example: "234e5678-e89b-12d3-a456-426614174001"
 *                 user_id:
 *                   type: string
 *                   description: The ID of the assigned user.
 *                   example: "345e6789-e89b-12d3-a456-426614174002"
 *                 crop_id:
 *                   type: string
 *                   description: The ID of the associated crop.
 *                   example: "456e7890-e89b-12d3-a456-426614174003"
 *                 assigned_at:
 *                   type: string
 *                   format: date-time
 *                   description: The assignment date and time.
 *                   example: "2024-11-20T10:00:00Z"
 *                 instructions:
 *                   type: string
 *                   description: The instructions for the task.
 *                   example: "Water the crops every morning."
 *                 remarks:
 *                   type: string
 *                   description: Remarks about the task.
 *                   example: "High priority due to upcoming inspection."
 *                 priority:
 *                   type: string
 *                   description: Priority of the task.
 *                   example: "normal"
 *                 status:
 *                   type: string
 *                   description: The status of the task.
 *                   example: "published"
 *                 task_status:
 *                   type: string
 *                   description: The current status of the task.
 *                   example: "not_started"
 *       400:
 *         description: Invalid input or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input. Required fields: farm_id, task_id."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post('', authenticate, authorize('farm_task', 'create', ['admin', 'planner', 'field_manager']), create);

/**
 * @swagger
 * /api/v1/farms/tasks/{id}:
 *   get:
 *     summary: Get a farm task by ID
 *     description: Retrieves a specific farm task by its ID.
 *     tags:
 *       - Farm Task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the farm task.
 *     responses:
 *       200:
 *         description: Farm task details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Farm task ID.
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 farm_id:
 *                   type: string
 *                   description: ID of the farm.
 *                   example: "e789f67a-d0fa-4bc0-b712-b8be6e78ec1b"
 *                 task_id:
 *                   type: string
 *                   description: ID of the task.
 *                   example: "b1111b67-d2da-4b0f-9d8e-68e7e8a1d2c0"
 *                 user_id:
 *                   type: string
 *                   description: ID of the user assigned to the task.
 *                   example: "f823aa7b-d4a1-43d5-bf5e-7133d9c929b1"
 *                 crop_id:
 *                   type: string
 *                   description: ID of the crop.
 *                   example: "b2341d50-09f5-4c13-a4a9-4656828b467a"
 *                 assigned_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date and time when the task is assigned.
 *                   example: "2024-11-01T10:00:00Z"
 *                 instructions:
 *                   type: string
 *                   description: Additional instructions for the task.
 *                   example: "Water the crops regularly."
 *                 remarks:
 *                   type: string
 *                   description: Remarks on the task.
 *                   example: "Complete the task by end of the week."
 *                 priority:
 *                   type: string
 *                   enum: [normal, moderate, critical]
 *                   description: Task priority (normal, moderate, critical).
 *                   example: "normal"
 *                 status:
 *                   type: string
 *                   enum: [draft, published]
 *                   description: Status of the task.
 *                   example: "published"
 *                 task_status:
 *                   type: string
 *                   enum: [not_started, completed]
 *                   description: Current status of the task.
 *                   example: "not_started"
 *       404:
 *         description: Farm task not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Farm task not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/:id', authenticate, authorize('farm_task', 'view', ['admin', 'planner', 'field_manager']), view);

/**
 * @swagger
 * /api/v1/farms/tasks/{id}:
 *   delete:
 *     summary: Delete a farm task by ID
 *     description: Deletes a farm task by its ID.
 *     tags:
 *       - Farm Task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the farm task to delete.
 *     responses:
 *       200:
 *         description: Farm task deleted successfully.
 *       404:
 *         description: Farm task not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Farm task not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete('/:id', authenticate, authorize('farm_task', 'delete', ['admin', 'planner', 'field_manager']), remove);

/**
 * @swagger
 * /api/v1/farms/tasks/{id}:
 *   patch:
 *     summary: Update a farm task by ID
 *     description: Updates a specific farm task by its ID with the provided data.
 *     tags:
 *       - Farm Task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the farm task to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farm_id:
 *                 type: string
 *                 description: ID of the farm.
 *               task_id:
 *                 type: string
 *                 description: ID of the task.
 *               user_id:
 *                 type: string
 *                 description: ID of the user assigned to the task.
 *               crop_id:
 *                 type: string
 *                 description: ID of the crop.
 *               assigned_at:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time when the task is assigned.
 *               instructions:
 *                 type: string
 *                 description: Additional instructions for the task.
 *               remarks:
 *                 type: string
 *                 description: Remarks on the task.
 *               priority:
 *                 type: string
 *                 enum: [normal, moderate, critical]
 *                 description: Task priority (normal, moderate, critical).
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Status of the task.
 *               task_status:
 *                 type: string
 *                 enum: [not_started, completed]
 *                 description: Current status of the task.
 *     responses:
 *       200:
 *         description: Farm task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Updated farm task ID.
 *       400:
 *         description: Bad request due to invalid fields or data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid fields in the request"
 *       404:
 *         description: Farm task not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Farm task not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.patch('/:id', authenticate, authorize('farm_task', 'update', ['admin', 'planner', 'field_manager']), update);

/**
 * @swagger
 * /api/v1/farms/tasks/status/{upload_id}:
 *   get:
 *     summary: Get CSV Upload Progress
 *     description: Fetches the upload progress of a CSV processing task by upload ID. Returns the progress percentage.
 *     parameters:
 *       - in: path
 *         name: upload_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the CSV upload task.
 *     responses:
 *       200:
 *         description: Upload progress fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upload_id:
 *                   type: string
 *                   description: The unique upload identifier.
 *                 percentage:
 *                   type: integer
 *                   description: The current progress percentage of the upload task.
 *                   example: 65
 *       400:
 *         description: Bad request due to invalid fields or data..
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid fields in the request."
 *       404:
 *         description: Upload ID not found or upload completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Upload ID not found or upload completed
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/status/:upload_id', getStatus);

module.exports = router;
