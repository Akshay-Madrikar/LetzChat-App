const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();

// Below code is any how run by express internally(bts) but
// here we're just refracting it
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

// **connection and disconnect are built-in events. Also join**
io.on('connection', (socket) => {
    console.log('Websocket connection!');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if(error) {
           return callback(error);
        }
        // join() is used to join a specific room
        socket.join(user.room);

        //emit() is used to send message from server when client connects
        // It takes 2 args:
        // 1. user-defined name/title of message
        // 2. Actual message body 
        // n-1: messages
        // Last(n): callback function for acknowledgement
        socket.emit('message', generateMessage('Admin', 'Welcome!'));

        // broadcast is send message to everyone except for current socket
        // to() is used to go to a specific room
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        
        callback();

    });
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter(); //bad-words npm library
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `A ${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        };
    });

});

server.listen(port, () => {
    console.log('Server is running up on port ' + port);
});