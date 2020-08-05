const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const dotenv = require('dotenv');
const {
  getUserById,
  doesUsernameExists,
  addNewUser,
  getAllUsers,
  removeUser,
} = require('./users');

// Configuring environmental variables
dotenv.config({ path: './config.env' });

// Setting out port to environmental variable our custom
const PORT = process.env.PORT || 8000;

// MIDDLEWARES
// Setting up our templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files from server
app.use(express.static(path.join(__dirname, 'public')));

// Body parser, reading data from body into rq.body
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.redirect(`/${process.env.ROOM_ID}`);
});

app.get('/:roomId', (req, res) => {
  if (req.params.roomId === process.env.ROOM_ID) res.render('chat-room');
  else {
    res.render('error-page');
  }
});

// SOCKET.IO CODE
io.on('connection', (socket) => {
  // This event is fired when the client sends a username to the server
  socket.on('new-user', (username, imgNumber) => {
    // Checking the username for duplication
    let doesUsernameExist = doesUsernameExists(username);

    // If username doesn't exist, we give the use the permissions
    if (!doesUsernameExist) {
      // Adding the user to the user data
      const userObject = addNewUser(socket.id, username, imgNumber);

      // This joins the user to thr room
      socket.join(process.env.ROOM_ID);

      // This event sends a event to all the remaining users that new user has joined
      socket.to(process.env.ROOM_ID).emit('notify-others', userObject, true);

      // This updates the message board for the remaining users with the new user info
      socket
        .to(process.env.ROOM_ID)
        .emit('update-members-tab', userObject, true);

      // Now user can remove the modal and join the chat, also this updates the message tab for this user
      socket.emit('user-acknowledged', userObject.username, getAllUsers());

      // This event is emmited by client when user starts typing
      socket.on('user-started-typing', () => {
        socket
          .to(process.env.ROOM_ID)
          .emit('notify-user-started-typing', userObject.username);
      });

      // This event is sent by client that the user stopped typing
      socket.on('user-stopped-typing', () => {
        socket
          .to(process.env.ROOM_ID)
          .emit('notify-user-stopped-typing', userObject.username);
      });

      // This event is for new chat messages sent by the client
      socket.on('new-chat-message', (message) => {
        // This event is fired by server to all the remaining users abt the new message
        socket
          .to(process.env.ROOM_ID)
          .emit('new-chat-message', message, userObject.username, Date.now());
      });

      // This is fired by the client when new voice message is created
      socket.on('new-voice-message', (audioFiles) => {
        // Sending this voice message to others
        socket
          .to(process.env.ROOM_ID)
          .emit(
            'new-voice-message',
            audioFiles.audioUrl,
            userObject.username,
            Date.now()
          );
      });

      // This is fired by the client when new image message is created
      socket.on('new-image-message', (imageFiles) => {
        // Sending this voice message to others
        socket
          .to(process.env.ROOM_ID)
          .emit(
            'new-image-message',
            imageFiles.imageUrl,
            userObject.username,
            Date.now()
          );
      });

      socket.on('disconnect', () => {
        removeUser(socket.id);
        socket.to(process.env.ROOM_ID).emit('notify-others', userObject, false);
        socket
          .to(process.env.ROOM_ID)
          .emit('update-members-tab', userObject, false);
      });

      // When username exists we send back the unauthorized event
    } else {
      socket.emit('username-exists');
    }
  });
});

// Server initialization
http.listen(PORT, () => {
  console.log('Server initialized at port: ' + PORT);
});
