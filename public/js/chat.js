// To connect to the server
const socket = io();

//--- Elements ---//
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//--- Templates ---//
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//--- Options ---//
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of new message
    const $newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt($newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far have you scrolled!
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    };
};

// on() to listen server's message
// It takes 2 args:
// 1. Same user-defined name/title of message defined in server
// 2. callback function to run message received from server
socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm a') // moment library to format time
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
    //console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url : message.url,
        createdAt: moment(message.createdAt).format('H:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');  // Disable send button

    const message = event.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');  // Enable send button
        $messageFormInput.value = ''; // To set value of input field to empty
        $messageFormInput.focus(); // To bring cursor on input after sending message

        if(error) {
            return console.log(error)
        }

        console.log('The message was delivered!');
    });
});

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    };

    $sendLocationButton.setAttribute('disabled', 'disabled');

    // get coordinates
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!');
        });
    });
});

// To join socket.io rooms
socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error);

        // To redirect to home page
        location.href = '/';
    };
});