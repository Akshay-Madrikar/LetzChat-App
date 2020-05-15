const users = [];

//---- Add user ----//
const addUser = ({ id, username, room }) => {
    // Clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        };
    };

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    // Validate username
    if(existingUser) {
        return {
            error: 'Sorry, username already taken :O'
        };
    };

    // Store user
    const user = { id, username, room };
    users.push(user);
    return {
        user
    };
};

//---- Remove user ----//
const removeUser = (id) => {
    //findIndex() will return -1 if user is not found else it'll return 0 or 1
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0];
    };
};

//----- Get an user ----//
const getUser = (id) => {
    return users.find((user) => user.id === id);
};

//---- Get users in particular room ----//
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};