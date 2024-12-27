const express = require('express');
const multer = require('multer');
const path = require('path');
const messageController = require('../controllers/messageController');

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Routes
router.post('/', upload.single('file'), messageController.sendMessage);
router.get('/:conversationId', messageController.getMessagesByConversation);

module.exports = router;
