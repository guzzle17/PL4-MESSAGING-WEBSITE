const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const cors = require('cors');

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
const { type } = require('@testing-library/user-event/dist/type');

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

    console.log("reqBody:", req.body);
    try {
      const { conversationId, senderId, message,receiverId = '' } = req.body;
      console.log(conversationId, senderId, message,receiverId);
      const type = "text";
        
      // Kiểm tra các trường yêu cầu
      if (!senderId || !message || !type) {
        return res.status(400).send('Please fill all required fields');
      }
      // Xử lý khi `conversationId` là 'new' và có `receiverId`
      let conversation_id;
      if (conversationId === 'new' && receiverId) {

        const existingConversation = await Conversations.findOne({
            participants: { $all: [senderId, receiverId] },
            $expr: { $eq: [{ $size: "$participants" }, 2] } // Kiểm tra số lượng participants là 2
        });
        if (existingConversation){
            conversation_id = existingConversation._id;
        }
        else {
            const newConversation = new Conversations({ participants: [senderId, receiverId] });
            await newConversation.save();
            conversation_id = newConversation._id;
        }
       
        
      } else if (conversationId) {
        // Sử dụng `conversationId` đã có
        conversation_id = conversationId;
      } else {
        return res.status(400).send('Please provide a valid conversation ID or receiver ID');
      }
  
      // Tạo một tin nhắn mới
      const newMessage = new Messages({
        conversation_id,
        sender_id: senderId,
        content: type === 'text' ? message : null, // Chỉ đặt `content` nếu type là "text"
        type,
   
        status: 'sent'
      });
  
      await newMessage.save();
      res.status(200).send('Message sent successfully');
    } catch (error) {
      console.log('MessageError', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  
  app.get('/api/message/:conversationId', async (req, res) => {
    try {
      const checkMessages = async (conversationId) => {
        console.log(conversationId, 'conversationId');
        const messages = await Messages.find({ conversation_id: conversationId });
        console.log("messages", messages);
        const messageUserData = await Promise.all(
          messages.map(async (message) => {
            return {
              user: { id: message.sender_id},
              message: message.content,
            };
          })
        );
        
        res.status(200).json(await messageUserData);
      };
  
      const conversationId = req.params.conversationId;
  
      if (conversationId === 'new') {
        const checkConversation = await Conversations.find({
          participants: { $all: [req.query.senderId, req.query.receiverId] },
        });
        // console.log("check cvs: ", checkConversation);
        if (checkConversation.length > 0) {
          await checkMessages(checkConversation[0]._id);
        } else {
          return res.status(200).json([]);
        }
      } else {
        await checkMessages(conversationId);
      }
    } catch (error) {
      console.log('Error', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  

  app.get('/api/users/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Lấy tất cả người dùng ngoại trừ người dùng có ID là userId
      const users = await Users.find({ _id: { $ne: userId } });
      
      // Duyệt qua danh sách người dùng và tạo dữ liệu người dùng cần thiết
     

      res.status(200).json(users);
    } catch (error) {
      console.log('Error', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


app.listen(port, () => {
    console.log("Listening on port " + port);
})