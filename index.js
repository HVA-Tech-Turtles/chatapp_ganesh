const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function(req, res) {
  res.sendFile(__dirname + "/" + "style.css");
});
app.get('/script.js', function(req, res) {
  res.sendFile(__dirname + "/" + "script.js");
});

io.on('connection', (socket) => {
  console.log(`A user connected with socket ID: ${socket.id}`);

  let userName = 'Anonymous';
  let currentRoom = 'Main Room'; 

  socket.on('join room', (room) => {
    if (room !== currentRoom) {
      socket.leave(currentRoom); 
      socket.join(room);
      currentRoom = room;
      console.log(`User ${socket.id} joined room: ${room}`);
    }
  });

  socket.on('set username', (name) => {
    userName = name || 'Anonymous';
    console.log(`User ${socket.id} set username to: ${userName}`);
  });

  socket.on('chat message', (msg) => {
    const message = msg.trim();
    if (message !== '') {
      
      const formattedMessage = `${userName}: ${message}`;
      console.log(`Message from ${socket.id} in room ${currentRoom}: ${formattedMessage}`);
      io.to(currentRoom).emit('chat message', formattedMessage);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
    socket.leave(currentRoom); 
  });
});

server.listen(9000, () => {
  console.log('Listening on *:9000');
});
