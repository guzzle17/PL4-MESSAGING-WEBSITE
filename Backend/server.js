const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const socketLogic = require('./socket/socket');

const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

// Initialize socket.io logic
socketLogic(io);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
