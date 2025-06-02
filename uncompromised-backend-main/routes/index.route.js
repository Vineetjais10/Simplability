const express = require('express');
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const roleRoutes = require('./role.route');
const permissionRoutes = require('./permission.route');
const taskRoutes = require('./task.route');
const cropRoutes = require('./crop.route');
const farmRoutes = require('./farm.route');
const farmTaskRoutes = require('./farm-task.route');
const farmTaskProofRoutes = require('./farmtask-proof.route');
const proofReasonRoutes = require('./proof-reason.route');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/crops', cropRoutes);
router.use('/farms/tasks', farmTaskRoutes);
router.use('/farms', farmRoutes);
router.use('/farm-task/proof', farmTaskProofRoutes);
router.use('/proof-reasons', proofReasonRoutes);

module.exports = router;
