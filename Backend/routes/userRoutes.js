const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.get('/:userId', userController.getUsersExceptCurrent);
router.put('/updateProfile', upload.single('newProfile_picture'), userController.updateUserProfile);

module.exports = router;
