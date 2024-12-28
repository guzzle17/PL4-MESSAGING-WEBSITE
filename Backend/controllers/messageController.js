const Messages = require('../models/messages');
const Conversations = require('../models/conversations');

const Users = require('../models/users');
exports.sendMessage = async (req, res) => {
  try {
          const { conversationId, senderId, message, receiverId = '' } = req.body;
          const file = req.file;
          let file_url = null;
          let type = 'text';
      
          if (file) {
            // Lưu đường dẫn tệp với tên và phần mở rộng
            file_url = `/uploads/${file.filename}`;
      
            // Xác định loại tệp dựa trên mime type
            if (file.mimetype.startsWith('image/')) {
              type = 'image';
            } else {
              type = 'file';
            }
          }
    
        if (!senderId || (!message && !file))
          return res.status(400).send('Please fill all required fields');
    
        if (conversationId === 'new' && receiverId) {
          const newConversation = new Conversations({
            members: [senderId, receiverId],
          });
          await newConversation.save();
          const newMessage = new Messages({
            conversationId: newConversation._id,
            senderId,
            message,
            type,
            file_url,
          });
          await newMessage.save();
          await Conversations.findByIdAndUpdate(newConversation._id, { last_message: newMessage._id, updated_at: newMessage.created_at });
          return res.status(200).json({ message: newMessage });
        } 
        const newMessage = new Messages({
          conversationId,
          senderId,
          message,
          type,
          file_url,
        });
        await newMessage.save();
        await Conversations.findByIdAndUpdate(conversationId, { last_message: newMessage._id, updated_at: newMessage.created_at });
        res.status(200).json({ message: newMessage });
      } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
      }
};

exports.getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.query.senderId;
    console.log(req.params);
    const checkMessages = async (conversationId) => {
        const messages = await Messages.find({ conversationId }).lean();
        const messageUserData = await Promise.all(
            messages.map(async (message) => {
                const user = await Users.findById(message.senderId);
                return {
                    user: { id: user._id, email: user.email, fullName: user.fullName, avatar: user.profile_picture },
                    message: message.message,
                    type: message.type,
                    file_url: message.file_url,
                };  
            })
        );
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const convo = await Conversations.findById(conversationId); // Không sử dụng callback
            if (convo) {
                console.log("lastRead: ", convo.lastRead);
                const existingRead = convo.lastRead.find(lr => lr.userId.toString() === userId);
                if (existingRead) {
                    existingRead.lastMessage = lastMessage._id;
                } else {
                    console.log("pushhhhhhhhhhhhhhhhhhhhh", userId, lastMessage._id)
                    convo.lastRead.push({ userId, lastMessage: lastMessage._id });
                }
                await convo.save();
            }
        }
        console.log("messageUserData: ", messageUserData);
        res.status(200).json(messageUserData);
    };

    if (conversationId === 'new') {
        const checkConversation = await Conversations.find({
            members: { $all: [req.query.senderId, req.query.receiverId] },
        });
        if (checkConversation.length > 0) {
          if (req.query.receiverId !== '') {
            const directConversation = checkConversation.find(conversation => !conversation.isGroup)
            if (directConversation != null)
              checkMessages(directConversation._id)
            else res.status(200).json([])
          }
          else checkMessages(checkConversation[0]._id);
        } else {
            res.status(200).json([]);
        }
    } else {
        checkMessages(conversationId);
    }
} catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Internal Server Error');
}
};
