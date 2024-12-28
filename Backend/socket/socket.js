const Users = require('../models/users');
const Messages = require('../models/messages');

let users = [];

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('addUser', userId => {
      const isUserExist = users.find(user => user.userId === userId);
      if (!isUserExist) {
          const user = { userId, socketId: socket.id };
          users.push(user);
          io.emit('getUsers', users);
      }
  });

  socket.on('sendMessage', async ({ senderId, members, message, conversationId, type, file_url }) => {
      console.log("send messages on", users)
      const receivers = users.filter(user => members.includes(user.userId));
      const sender = users.find(user => user.userId === senderId);
      const user = await Users.findById(senderId);
      console.log("sender: ", sender)
      console.log("receivers: ", receivers)
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
    
  });
};
