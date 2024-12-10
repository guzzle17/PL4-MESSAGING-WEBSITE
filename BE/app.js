const express = require('express');
const bcryptjs = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const io = require('socket.io')(8080, {
    cors: {
        origin: '*',
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Thư mục lưu tệp
    },
    filename: function (req, file, cb) {
      // Lấy phần mở rộng của tệp
      const ext = path.extname(file.originalname);
      // Tạo tên tệp mới dựa trên thời gian hiện tại và tên gốc
      const filename = Date.now() + '-' + file.originalname;
      cb(null, filename);
    },
  });


const upload = multer({ storage: storage });

// Connect DB
require('./db/connection');

// Import Files
const Users = require('./Models/users');
const Conversations = require('./Models/conversations');
const Messages = require('./Models/messages');

// app Use

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const corsOptions = {
    origin: '*',
   
};

app.use(cors(corsOptions));

const port = process.env.PORT || 8000;

// Socket.io
let users = [];
io.on('connection', socket => {
    console.log('User connected', socket.id);
    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, members, message, conversationId, type, file_url }) => {
        const receivers = users.filter(user => members.includes(user.userId));
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);
      
        const messageData = {
          senderId,
          message,
          conversationId,
          members,
          user: { id: user._id, fullName: user.fullName, email: user.email },
          type,
          file_url,
        };
        if (receivers && receivers.length > 0) {
            receivers.forEach(receiver => {
              if (receiver.userId !== sender.userId) {
                io.to(receiver.socketId).emit('getMessage', messageData);
              }
            });
            io.to(sender.socketId).emit('getMessage', messageData);
          } else {
            io.to(sender.socketId).emit('getMessage', messageData);
          }
          
      });
    socket.on('disconnect', () => {
        console.log("active users left ", users);
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
    // io.emit('getUsers', socket.userId);
});

// Routes
app.get('/', (req, res) => {
    res.send('Welcome');
})

app.post('/api/register', async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            res.status(400).send('Please fill all required fields');
        } else {
            const isAlreadyExist = await Users.findOne({ email });
            if (isAlreadyExist) {
                res.status(400).send('User already exists');
            } else {
                const newUser = new Users({ fullName, email });
                bcryptjs.hash(password, 10, (err, hashedPassword) => {
                    newUser.set('password', hashedPassword);
                    newUser.save();
                    next();
                })
                return res.status(200).send('User registered successfully');
            }
        }

    } catch (error) {
        console.log(error, 'Error')
    }
})

app.post('/api/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).send('Please fill all required fields');
        } else {
            const user = await Users.findOne({ email });
            if (!user) {
                res.status(400).send('User email or password is incorrect');
            } else {
                const validateUser = await bcryptjs.compare(password, user.password);
                if (!validateUser) {
                    res.status(400).send('User email or password is incorrect');
                } else {
                    const payload = {
                        userId: user._id,
                        email: user.email
                    }
                    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';

                    jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
                        await Users.updateOne({ _id: user._id }, {
                            $set: { token }
                        })
                        user.save();
                        return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token: token })
                    })
                }
            }
        }

    } catch (error) {
        console.log(error, 'Error')
    }
})



app.post('/api/conversation', async (req, res) => {
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
});






app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Lấy tất cả các cuộc hội thoại của userId
        const conversations = await Conversations.find({ members: { $in: [userId] } });

        // Xử lý dữ liệu trả về
        const conversationUserData = await Promise.all(
            conversations.map(async (conversation) => {
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
                    };
                }
            })
        );

        res.status(200).json(conversationUserData);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/message', upload.single('file'), async (req, res) => {
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
      res.status(200).json({ message: newMessage });
    } catch (error) {
      console.log(error, 'Error');
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/api/message/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
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
            console.log("messageUserData: ", messageUserData);
            res.status(200).json(messageUserData);
        };

        if (conversationId === 'new') {
            const checkConversation = await Conversations.find({
                members: { $all: [req.query.senderId, req.query.receiverId] },
            });
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id);
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
});


app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const users = await Users.find({ _id: { $ne: userId } });
        const usersData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, fullName: user.fullName, receiverId: user._id } }
        }))
        res.status(200).json(await usersData);
    } catch (error) {
        console.log('Error', error)
    }
})




app.post('/api/conversation/editinformation', upload.single('file'), async (req, res) => {
    try {
        const { conversationId, groupName } = req.body;
        let avatarUrl = null;

        // Nếu có tệp được tải lên
        if (req.file) {
            // Giả sử bạn muốn lưu đường dẫn tệp (hoặc URL nếu dùng Cloudinary, S3,...)
            avatarUrl = `/uploads/${req.file.filename}`;  // Lưu đường dẫn tới tệp
        }

        // Tìm và cập nhật cuộc trò chuyện theo ID
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            {
                groupName: groupName || undefined,  // Cập nhật tên nhóm nếu có
                avatar: avatarUrl || undefined       // Cập nhật ảnh nhóm nếu có tệp tải lên
            },
            { new: true }  // Trả về tài liệu mới sau khi cập nhật
        );

        // Kiểm tra nếu không tìm thấy nhóm
        if (!updatedConversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

         // After editing group info
         io.to(conversationId).emit('groupInfoUpdated', { conversationId, groupName, avatarUrl });

        return res.status(200).json(updatedConversation);
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
});


// Update group information (name and avatar)
app.put('/api/conversation/:conversationId', upload.single('avatar'), async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { senderId, groupName } = req.body;
        let avatarUrl = null;

        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
        }

        // Find the conversation
        const conversation = await Conversations.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if sender is admin
        if (!conversation.admins.includes(senderId)) {
            return res.status(403).json({ message: 'Only admins can edit group information' });
        }

        // Update fields if provided
        if (groupName) {
            conversation.groupName = groupName;
        }
        if (avatarUrl) {
            conversation.avatar = avatarUrl;
        }

        await conversation.save();

        res.status(200).json({
            isGroup: true,
            nameConversation: conversation.groupName,
            conversationId: conversation._id,
            discription: conversation.members.length + " thành viên",
            admins: conversation.admins,
            avatar: conversation.avatar,
            members: conversation.member,
        });
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
});

// Leave a group
app.post('/api/conversation/:conversationId/leave', async (req, res) => {
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
});
// Delete a group (admin only)
app.delete('/api/conversation/:conversationId', async (req, res) => {
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
      
        io.emit('groupDeleted', { conversationId });

    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
});
// Add members to a group (admin only)
app.post('/api/conversation/:conversationId/addMembers', async (req, res) => {
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
        io.to(conversationId).emit('memberAdded', { conversationId, newMembers: membersToAdd });

       


    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
});
// Remove members from a group (admin only)
app.post('/api/conversation/:conversationId/removeMembers', async (req, res) => {
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
         io.to(conversationId).emit('memberRemoved', { conversationId, removedMembers: membersToRemove });

    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Internal Server Error');
    }
});


// Phân quyền quản trị viên cho một thành viên
app.post('/api/conversation/:conversationId/assignAdmin', async (req, res) => {
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
});


app.listen(port, () => {
    console.log('listening on port ' + port);
})