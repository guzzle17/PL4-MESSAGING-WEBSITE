const express = require('express');
const multer = require('multer');
const conversationController = require('../controllers/conversationController');

// Cấu hình upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.put('/:conversationId', upload.single('avatar'), conversationController.updateGroupInformation);
router.get('/:userId', conversationController.getListConversations);
router.post('/:conversationId/leave', conversationController.leaveGroupConversations);
router.delete('/:conversationId', conversationController.deleteGroupConversations);
router.post('/:conversationId/addMembers', conversationController.addMembersToGroupConversations);
router.post('/:conversationId/removeMembers', conversationController.removeMembersFromGroupConversations);
router.post('/:conversationId/assignAdmin', conversationController.assignAdmin);
module.exports = router;
