const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();

// Below code is any how run by express internally(bts) but
// here we're just refracting it
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

// **connection and disconnect are built-in events**
io.on('connection', (socket) => {
    console.log('Websocket connection!');

    //emit() is used to send message from server when client connects
    // It takes 2 args:
    // 1. user-defined name/title of message
    // 2. Actual message body 
    // n-1: messages
    // Last(n): callback function for acknowledgement
    socket.emit('message', generateMessage('Welcome!'));

    // broadcast
    socket.broadcast.emit('message', generateMessage('A new user has joined!'));

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter(); //bad-words npm library
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!');
        }

        io.emit('message', generateMessage(message));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left'));
    });

});

server.listen(port, () => {
    console.log('Server is running up on port ' + port);
});