const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/:userId', userController.getUsersExceptCurrent);
router.post('/updateProfile', userController.updateUserProfile);

module.exports = router;
