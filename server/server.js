const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Connecting to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Serve HTML files
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');

  // Join a room
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    socket.broadcast.to(room).emit('message', {
      user: 'admin',
      text: `${username} has joined the chat`,
    });
  });

  socket.on('sendMessage', ({ from_user, room, message }) => {
    const msgData = {
      from_user, // Include the from_user field
      room,
      message,
      date_sent: new Date(),
    };

    const GroupMessage = require('./models/GroupMessage');
    const newMessage = new GroupMessage(msgData);
    newMessage.save().catch((err) => console.error('Error saving message:', err));

    io.to(room).emit('message', msgData);
  });

  socket.on('leaveRoom', ({ username, room }) => {
    socket.leave(room);
    console.log(`${username} left room: ${room}`);
    socket.broadcast.to(room).emit('message', {
      user: 'admin',
      text: `${username} has left the chat`,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Starting the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));