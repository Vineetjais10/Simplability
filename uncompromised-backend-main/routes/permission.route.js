const express = require('express');
const { create, view, update, remove, index } = require('../controllers/permissions/permission.controller');
const router = express.Router();

router.get('', index);
router.post('', create);
router.get('/:id', view);
router.put('/:id', update);
router.delete('/:id', remove);

// router.get('', authenticate, authorize('permission', 'read', ['Admin', 'Super Admin']), index);
// router.post('', authenticate, authorize('permission', 'create', ['Admin', 'Super Admin']), create);
// router.get('/:id', authenticate, authorize('permission', 'view', ['Admin', 'Super Admin']), view);
// router.put('/:id', authenticate, authorize('permission', 'update', ['Admin', 'Super Admin']), update);
// router.delete('/:id', authenticate, authorize('permission', 'delete', ['Admin', 'Super Admin']), remove);

module.exports = router;
