const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')
const {valueJoin, getAllValuesInARoom, removeValue} = require('./utils/values')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

  socket.on('joinRoom', ({username, room}) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', 'Welcome to Scrum Poker');

    socket.broadcast.to(user.room).emit('message', `${user.username} has joined the room`);
  
    socket.on('selected', ({username, room, button}) => {
      const value = valueJoin(socket.id, username, room, button)
    });
  
    socket.on('display', (room) => {
      const users = getAllValuesInARoom(room);
      io.to(user.room).emit('getAllValues', users);
    });

  });


  socket.on('disconnect', () => {

    const user = userLeave(socket.id);
    if(user){
      const value = removeValue(socket.id);
      io.to(user.room).emit('message', `${user.username} has left the room`);
    }
  })

})


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {

  console.log(`SERVER STARTED on port ${PORT}`);

});