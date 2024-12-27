const Conversations = require('../models/conversations');
const Users = require('../models/users');
const Messages = require('../models/messages');
exports.createGroup = async (req, res) => {
  try {
          const { senderId, receiverId, isGroup, groupName } = req.body;
  
          if (!isGroup || !receiverId || !senderId || !groupName) {
              return res.status(400).send('Invalid group data');
          }
          console.log("check req ", req.body); 
          console.log("recievers ", receiverId);
          const newConversation = new Conversations({
              members: [senderId, ...receiverId],
              isGroup: true,
              groupName,
              admins: [senderId], 
          });
  
          await newConversation.save();
  
          res.status(200).json({
              conversationId: newConversation._id,
              groupName: newConversation.groupName,
              members: newConversation.members,
              admins: newConversation.admins,
          });
      } catch (error) {
          console.error('Error creating group:', error);
          res.status(500).send('Internal Server Error');
      }
};

exports.getListConversations = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Lấy tất cả các cuộc hội thoại của userId
        const conversations = await Conversations.find({ members: { $in: [userId] } });

        // Xử lý dữ liệu trả về
        const conversationUserData = await Promise.all(
            conversations.map(async (conversation) => {
                let unread = false;
                if (conversation.last_message) {
                    // Tìm lastRead cho user
                    console.log("userLastRead: ", conversation.lastRead, userId);
                    const userLastRead = conversation.lastRead.find(lr => lr.userId.toString() === userId);
                    if (userLastRead) {
                        const lastReadMessage = await Messages.findById(userLastRead.lastMessage);
                        if (lastReadMessage && conversation.last_message.created_at > lastReadMessage.created_at) {
                            unread = true;
                        }   
                    } else {
                        // Nếu không có lastRead, đánh dấu là chưa đọc
                        unread = true;
                    }
                }
                if (conversation.isGroup) {
                    // Nếu là nhóm, trả về thông tin nhóm
                    const members = await Users.find(
                        { _id: { $in: conversation.members } },
                        'fullName email profile_picture'
                    );
                    return {
                        isGroup: true,
                        nameConversation: conversation.groupName,
                        conversationId: conversation._id,
                        discription: members.length + " thành viên",
                        admins: conversation.admins,
                        avatar: conversation.avatar,
                        members,
                        unread,
                        updated_at: conversation.updated_at
                    };
                } else {
                    // Nếu là hội thoại cá nhân, tìm người nhận
                    const receiverId = conversation.members.find((member) => member.toString() !== userId);
                    const user = await Users.findById(receiverId, 'fullName email');
                    return {
                        isGroup: false,
                        // user: {
                        //     receiverId: user._id,
                        //     email: user.email,
                        //     fullName: user.fullName,
                        // },
                        nameConversation: user.fullName,
                        discription: user.email,
                        members: [user],
                        admins: [],
                        avatar: user.profile_picture,
                        conversationId: conversation._id,
                        unread,
                        updated_at: conversation.updated_at
                    };
                }
            })
        );
        conversationUserData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        res.status(200).json(conversationUserData);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.updateGroupInformation = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { senderId, groupName } = req.body;
      let avatarUrl = null;
  
      // Kiểm tra nếu có tệp tải lên
      if (req.file) {
        avatarUrl = `/uploads/${req.file.filename}`;
      }
  
      // Tìm cuộc trò chuyện theo ID
      const conversation = await Conversations.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
  
      // Kiểm tra nếu người gửi là admin
      if (!conversation.admins.includes(senderId)) {
        return res.status(403).json({ message: 'Only admins can edit group information' });
      }
  
      // Cập nhật các trường nếu được cung cấp
      if (groupName) {
        conversation.groupName = groupName;
      }
      if (avatarUrl) {
        conversation.avatar = avatarUrl;
      }
  
      // Lưu thay đổi
      await conversation.save();
  
      res.status(200).json({
        isGroup: true,
        nameConversation: conversation.groupName,
        conversationId: conversation._id,
        description: `${conversation.members.length} thành viên`,
        admins: conversation.admins,
        avatar: conversation.avatar,
        members: conversation.members,
      });
    } catch (error) {
      console.error('Error updating group information:', error);
      res.status(500).send('Internal Server Error');
    }
};


exports.leaveGroupConversations = async (req, res) => {
   try {
           const { conversationId } = req.params;
           const { userId } = req.body;
   
           const conversation = await Conversations.findById(conversationId);
           if (!conversation) {
               return res.status(404).json({ message: 'Conversation not found' });
           }
   
           // Remove user from members
           conversation.members = conversation.members.filter(member => member.toString() !== userId);
   
           // If user is an admin, remove from admins
           if (conversation.admins.includes(userId)) {
               conversation.admins = conversation.admins.filter(admin => admin.toString() !== userId);
           }
   
           // If no admins left, assign the first member as admin (if any)
           if (conversation.admins.length === 0 && conversation.members.length > 0) {
               conversation.admins.push(conversation.members[0]);
           }
   
           await conversation.save();
   
           res.status(200).json({ message: 'Left the group successfully' });
       } catch (error) {
           console.log(error, 'Error');
           res.status(500).send('Internal Server Error');
       }
};


exports.deleteGroupConversations = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { senderId } = req.body;

        const conversation = await Conversations.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if sender is admin
        if (!conversation.admins.includes(senderId)) {
            return res.status(403).json({ message: 'Only admins can delete the group' });
        }

        // Delete all messages related to the conversation
        await Messages.deleteMany({ conversationId });

        // Delete the conversation
        await Conversations.findByIdAndDelete(conversationId);

        res.status(200).json({ message: 'Group deleted successfully' });
       

    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
 };

exports.addMembersToGroupConversations = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { senderId, membersToAdd } = req.body; // membersToAdd should be an array of userIds

        const conversation = await Conversations.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if sender is admin
        if (!conversation.admins.includes(senderId)) {
            return res.status(403).json({ message: 'Only admins can add members' });
        }

        // Add new members, avoiding duplicates
        const newMembers = membersToAdd.filter(member => !conversation.members.includes(member));
        conversation.members.push(...newMembers);

        await conversation.save();
        const conversationsss = await Conversations.findById(conversationId);
        console.log("check add: ", conversationsss);
        res.status(200).json({ message: 'Members added successfully', members: conversation.members });
        // After adding a member
        // io.to(conversationId).emit('memberAdded', { conversationId, newMembers: membersToAdd });

        


    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
};


exports.removeMembersFromGroupConversations = async (req, res) => {
   try {
        const { conversationId } = req.params;
        const { senderId, membersToRemove } = req.body; // membersToRemove should be an array of userIds

        const conversation = await Conversations.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if sender is admin
        if (!conversation.admins.includes(senderId)) {
            return res.status(403).json({ message: 'Only admins can remove members' });
        }

        // Remove specified members
        conversation.members = conversation.members.filter(member => !membersToRemove.includes(member.toString()));
        conversation.admins = conversation.admins.filter(admin => !membersToRemove.includes(admin.toString()));

        // If no admins left, assign the first member as admin (if any)
        if (conversation.admins.length === 0 && conversation.members.length > 0) {
            conversation.admins.push(conversation.members[0]);
        }

        await conversation.save();

        res.status(200).json({ message: 'Members removed successfully', members: conversation.members });
        // After removing a member
        // io.to(conversationId).emit('memberRemoved', { conversationId, removedMembers: membersToRemove });

    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
};


exports.assignAdmin = async (req, res) => {
    try {
            const { conversationId } = req.params;
            const { senderId, memberId } = req.body;
    
            const conversation = await Conversations.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
    
            // Kiểm tra nếu người gửi là admin
            if (!conversation.admins.includes(senderId)) {
                return res.status(403).json({ message: 'Only admins can assign admin roles' });
            }
    
            // Kiểm tra nếu memberId là thành viên của nhóm
            if (!conversation.members.includes(memberId)) {
                return res.status(400).json({ message: 'Member is not part of the group' });
            }
    
            // Kiểm tra nếu memberId đã là admin
            if (conversation.admins.includes(memberId)) {
                return res.status(400).json({ message: 'Member is already an admin' });
            }
    
            // Thêm memberId vào danh sách admins
            conversation.admins.push(memberId);
            await conversation.save();
    
            res.status(200).json({ message: 'Member has been assigned as admin', admins: conversation.admins });
        } catch (error) {
            console.log(error, 'Error');
            res.status(500).send('Internal Server Error');
        }
 };
 
 