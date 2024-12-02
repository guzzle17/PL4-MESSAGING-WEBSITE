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

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId, type, file_url }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);
      
        const messageData = {
          senderId,
          message,
          conversationId,
          receiverId,
          user: { id: user._id, fullName: user.fullName, email: user.email },
          type,
          file_url,
        };
      
        if (receiver) {
          io.to(receiver.socketId).to(sender.socketId).emit('getMessage', messageData);
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

        const newConversation = new Conversations({
            members: [senderId, ...receiverId],
            isGroup: true,
            groupName,
            admins: [senderId], // Người tạo nhóm là quản trị viên mặc định
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
                        'fullName email'
                    );
                    return {
                        isGroup: true,
                        groupName: conversation.groupName,
                        conversationId: conversation._id,
                        members,
                    };
                } else {
                    // Nếu là hội thoại cá nhân, tìm người nhận
                    const receiverId = conversation.members.find((member) => member.toString() !== userId);
                    const user = await Users.findById(receiverId, 'fullName email');
                    return {
                        isGroup: false,
                        user: {
                            receiverId: user._id,
                            email: user.email,
                            fullName: user.fullName,
                        },
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
      } else if (!conversationId && !receiverId) {
        return res.status(400).send('Please fill all required fields');
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

        const checkMessages = async (conversationId) => {
            const messages = await Messages.find({ conversationId }).lean();
            const messageUserData = await Promise.all(
                messages.map(async (message) => {
                    const user = await Users.findById(message.senderId);
                    return {
                        user: { id: user._id, email: user.email, fullName: user.fullName },
                        message: message.message,
                        type: message.type,
                        file_url: message.file_url,
                    };
                })
            );
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

app.listen(port, () => {
    console.log('listening on port ' + port);
})