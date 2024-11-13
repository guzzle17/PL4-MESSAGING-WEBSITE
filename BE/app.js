const express = require('express')
const cors = require('cors'); // Import cors

const app = express();

app.use(cors()); 
require('./db/connection')

const Users = require('./Models/users');
const Conversations = require('./Models/conversations'); // Đường dẫn chính xác đến file Conversation.js
const Messages = require('./Models/messages');


app.use(express.json());
app.use(express.urlencoded({extended:false}));




const port = process.env.port || 8000


app.get('/', (req, res) => {
    res.send("Welcome");
    // res.end();
})


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.post('/api/register', async (req, res) => {
    try {
        console.log("Body content:", req.body); // Kiểm tra dữ liệu nhận được

        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        const isAlreadyExist = await Users.findOne({ email });
        if (isAlreadyExist) {
            return res.status(400).send('User already exists');
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới với mật khẩu đã mã hóa
        const newUser = new Users({ fullName, email, password: hashedPassword });
        await newUser.save();

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while registering user');
    }
});


app.post('/api/login', async (req, res) => {
    try {
        console.log(req.body); // Kiểm tra dữ liệu nhận được

        const { email, password } = req.body;
        
        // Kiểm tra xem các trường có đầy đủ không
        if (!email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        // Tìm người dùng với email đã cung cấp
        const user = await Users.findOne({ email });
        
        // Nếu người dùng không tồn tại, trả về lỗi
        if (!user) {
            return res.status(400).send('User email or password is incorrect');
        }

        // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa
        const validateUser = await bcrypt.compare(password, user.password);
        
        // Nếu mật khẩu không khớp, trả về lỗi
        if (!validateUser) {
            return res.status(400).send('User email or password is incorrect');
        }

        // Tạo payload cho JWT
        const payload = {
            userId: user._id,
            email: user.email
        };

        // Tạo token với JWT_SECRET_KEY
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';
        const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }); // Token hết hạn sau 1 ngày (84600 giây)

        // Cập nhật token trong cơ sở dữ liệu
        await Users.updateOne({ _id: user._id }, { $set: { token } });

        // Trả về token cho người dùng
        res.status(200).json({
            user: {id: user.id, email: email, fullName: user.fullName},
            message: 'Login successful',
            token: token
        });

    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send('An error occurred while logging in');
    }
});



app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        // Kiểm tra nếu cuộc trò chuyện chỉ giữa 2 người đã tồn tại
        const existingConversation = await Conversations.findOne({
            participants: { $all: [senderId, receiverId] },
            $expr: { $eq: [{ $size: "$participants" }, 2] } // Kiểm tra số lượng participants là 2
        });

        if (existingConversation) {
            return res.status(200).send('Conversation already exists');
        }

        // Tạo cuộc trò chuyện mới
        const newConversation = new Conversations({
            participants: [senderId, receiverId],
            created_at: Date.now(),
            updated_at: Date.now()
        });
        
        await newConversation.save();
        res.status(200).send('Conversation created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating conversation');
    }
});


app.get('/api/conversation/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Tìm các cuộc trò chuyện mà userId tham gia
        const conversations = await Conversations.find({ participants: { $in: [userId] } });

        // Lấy thông tin người dùng khác trong mỗi cuộc trò chuyện
        const conversationUserData = await Promise.all(conversations.map(async (conversation) => {
            // Tìm người tham gia khác trong cuộc trò chuyện (người không phải là userId)
            const otherUserId = conversation.participants.find(participant => participant.toString() !== userId);

            // Lấy thông tin chi tiết của người dùng khác
            if (otherUserId) {
                const otherUser = await Users.findById(otherUserId);
                return {
                    conversationId: conversation._id,
                    participants: conversation.participants,
                    otherUser: otherUser,
                    last_message: conversation.last_message,
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at
                };
            } else {
                return null;
            }
        }));

        // Lọc bỏ các giá trị null (nếu có)
        const filteredConversationData = conversationUserData.filter(data => data !== null);

        console.log('conversationUserData:', filteredConversationData);
        res.status(200).json(filteredConversationData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving conversations');
    }
});


// app.post('/api/message', async (req, res) => {
//     try {
//         const { conversationId, senderId, message } = req.body;

//         // Tạo tin nhắn mới
//         const newMessage = new Messages({
//             conversation_id: conversationId,
//             sender_id: senderId,
//             content: message,
//             type: 'text', // Giả sử đây là tin nhắn văn bản
//             created_at: Date.now(),
//             status: 'sent'
//         });

//         // Lưu tin nhắn vào database
//         await newMessage.save();

//         // Cập nhật trường last_message trong cuộc trò chuyện với tin nhắn vừa tạo
//         await Conversations.findByIdAndUpdate(conversationId, { last_message: newMessage._id, updated_at: Date.now() });

//         res.status(200).send('Message sent successfully');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error sending message');
//     }
// });

// app.get('/api/message/:conversationId', async (req, res) => {
//     try {
//         const conversationId = req.params.conversationId;

//         // Tìm tất cả các tin nhắn trong cuộc trò chuyện dựa trên conversation_id
//         const messages = await Messages.find({ conversation_id: conversationId });

//         // Lấy dữ liệu chi tiết về người gửi cho từng tin nhắn
//         const messageUserData = await Promise.all(messages.map(async (message) => {
//             const user = await Users.findById(message.sender_id); // Tìm thông tin người gửi
//             return {
//                 user: {
//                     email: user.email,
//                     fullName: user.fullName
//                 },
//                 message: message.content,
//                 created_at: message.created_at,
//                 status: message.status
//             };
//         }));

//         // Trả về danh sách tin nhắn và thông tin người gửi
//         res.status(200).json(messageUserData);
//     } catch (error) {
//         console.log('Error', error);
//         res.status(500).send('Error retrieving messages');
//     }
// });



app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId } = req.body;

        // Kiểm tra xem các trường cần thiết có hợp lệ không
        if (!senderId || !message || (!conversationId && !receiverId)) {
            return res.status(400).send('Please fill all required fields');
        }

        // Kiểm tra nếu senderId và receiverId là ObjectId hợp lệ
        if ((!conversationId && (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)))) {
            return res.status(400).send('Invalid Sender ID or Receiver ID');
        }

        // Nếu conversationId không có, tạo cuộc trò chuyện mới
        if (!conversationId) {
            const newConversation = new Conversations({
                participants: [senderId, receiverId]
            });

            await newConversation.save();

            // Tạo tin nhắn mới với conversationId của cuộc trò chuyện vừa tạo
            const newMessage = new Messages({
                conversation_id: newConversation._id,
                sender_id: senderId,
                content: message,
                created_at: Date.now(),
                status: 'sent'
            });

            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        } else {
            // Nếu đã có conversationId, gửi tin nhắn trực tiếp vào cuộc trò chuyện đó
            const newMessage = new Messages({
                conversation_id: conversationId,
                sender_id: senderId,
                content: message,
                created_at: Date.now(),
                status: 'sent'
            });

            await newMessage.save();
            res.status(200).send('Message sent successfully');
        }
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Error sending message');
    }
});

app.get('/api/message/:conversationId', async (req, res) => {
    try {
        const conversationId = req.params.conversationId;

        // Kiểm tra nếu `conversationId` là 'new' thì trả về mảng rỗng
        if (conversationId === 'new') {
            return res.status(200).json([]);
        }

        // Tìm tất cả tin nhắn thuộc `conversationId`
        const messages = await Messages.find({ conversation_id: conversationId });

        // Lấy thông tin người gửi cho mỗi tin nhắn
        const messageUserData = await Promise.all(messages.map(async (message) => {
            const user = await Users.findById(message.sender_id);
            return {
                user: {
                    email: user.email,
                    fullName: user.fullName
                },
                message: message.content, // Sử dụng `message.content` thay vì `message.message`
                created_at: message.created_at,
                status: message.status
            };
        }));

        // Trả về danh sách tin nhắn cùng thông tin người gửi
        res.status(200).json(messageUserData);
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Error retrieving messages');
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await Users.find();

        // Trả về danh sách người dùng với thông tin cần thiết
        const usersData = users.map(user => ({
            email: user.email,
            fullName: user.fullName,
            userId: user._id
        }));

        res.status(200).json(usersData);
    } catch (error) {
        console.error('Error', error);
        res.status(500).send('Error retrieving users');
    }
});


app.listen(port, () => {
    console.log("Listening on port " + port);
})