import { displayTheModal } from './modalCreator.js';
import { recordVoice, sleep } from './recordVoice.js';

var socket = io();

// Grabing the DOM Elements
const form = document.getElementById('msg-typing-form');
const newChatMsgElement = document.getElementById('new-msg');
const attachBtn = document.getElementById('attach-btn');
const chatsContainer = document.querySelector('.chats');
const peopleContainer = document.querySelector('.people-container');
const emojiBtn = document.getElementById('emoji-btn');
const emojiBoard = document.getElementById('emoji-board');
const emojiHeader = document.getElementById('emoji-header');
const emojiContentElement = document.getElementById('emoji-content');
const gifSearchElement = document.getElementById('gif-search');
const gifContentElement = document.getElementById('gif-content');
const recordBtn = document.getElementById('record-voice');
const typingInfoContainer = document.querySelector('.typing-info');
const voiceRecordingElements = document.querySelector(
  '.voice-recording-elements'
);

// Global Variables
const roomId = window.location.pathname;
const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs';
const GIPHY_API_KEY = '5y5EME7lzJnBGk6fmhUkIIRHvkmiyu8k';
const EMOJI_API_URL =
  'https://emoji-api.com/emojis?access_key=3c0443d6098fa79a5b8164a4c7851ed6edf7ddd3';
let USERNAME = null;
let isTyping = false;
let limit = 15;

const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
let recordingFunctions, alreadyStopped;

// EVENT LISTENERS
// form (new chat message) submission
form.onsubmit = (event) => {
  event.preventDefault();

  const message = newChatMsgElement.value.trim();

  if (message.length > 0) {
    // socket events here!
    addNewMessage(message, USERNAME, Date.now(), true, 'text');

    socket.emit('user-stopped-typing');
    isTyping = false;

    socket.emit('new-chat-message', message);

    if (!emojiBoard.classList.contains('hidden-class')) {
      emojiBoard.classList.add('hidden-class');
    }
  }

  newChatMsgElement.value = '';
  newChatMsgElement.focus();
};

// user is typing feature code
newChatMsgElement.onkeypress = () => {
  if (!isTyping) {
    socket.emit('user-started-typing');
    isTyping = true;
  }
};

newChatMsgElement.onblur = () => {
  if (newChatMsgElement.value.length > 0) {
    socket.emit('user-stopped-typing');
    isTyping = false;
  }
};

// Attach files
attachBtn.onclick = () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = false;
  fileInput.accept = 'image/*';

  fileInput.click();

  fileInput.onchange = () => {
    const uploadedImage = fileInput.files[0];

    if (validImageTypes.includes(uploadedImage.type)) {
      const blob = new Blob([fileInput.files[0]]);
      const imageUrl = URL.createObjectURL(blob);

      addNewMessage(imageUrl, USERNAME, Date.now(), true, 'image');

      socket.emit('new-image-message', { blob, imageUrl }, true);
    }
  };
};

// Emoji board toggle
emojiBtn.onclick = () => {
  emojiBoard.classList.toggle('hidden-class');
};

// Emoji board header listener
emojiHeader.onclick = () => {
  const clickedTarget = event.target;

  if (clickedTarget.tagName === 'IMG') {
    clickedTarget.id === 'emoji-tab'
      ? (emojiContentElement.classList.remove('shift-left'),
        gifContentElement.classList.add('shift-right'))
      : (emojiContentElement.classList.add('shift-left'),
        gifContentElement.classList.remove('shift-right'));
  }
};

// Emojis event listener
emojiContentElement.onclick = (event) => {
  const emoji = event.target;

  if (emoji.tagName === 'SPAN') {
    const newChatMsgElement = document.getElementById('new-msg');
    newChatMsgElement.value += `${emoji.textContent}`;
  }
};

// Gif search
gifSearchElement.onkeypress = (e) => {
  if (e.which === 13 || e.keycode === 13) {
    e.preventDefault();

    if (e.target.value.trim().length > 0)
      getGiphyContent('search', e.target.value.trim());
  }
};

// Gifs event listener
gifContentElement.onclick = (event) => {
  const gif = event.target;

  if (gif.tagName === 'IMG') {
    addNewMessage(gif.src, USERNAME, Date.now(), true, 'image');
    socket.emit('new-image-message', { blob: null, imageUrl: gif.src }, false);
  }
};

// Voice record
recordBtn.onmousedown = async () => {
  voiceRecordingElements.classList.toggle('no-display');
  recordingFunctions = await recordVoice();

  recordingFunctions.start();
  alreadyStopped = false;

  await sleep(3000);
  addNewAudioMessage();
};

const addNewAudioMessage = async () => {
  if (!alreadyStopped) {
    alreadyStopped = true;

    const audioFiles = await recordingFunctions.stop();

    socket.emit('new-voice-message', audioFiles);
    addNewMessage(audioFiles.audioUrl, USERNAME, Date.now(), true, 'audio');
  }
};

recordBtn.onmouseup = async () => {
  await sleep(300);
  voiceRecordingElements.classList.toggle('no-display');
  addNewAudioMessage();
};

// ---------------------------------------------------------------------
// SOCKET EVENTS
socket.on('notify-others', (userObject, hasJoined) => {
  // Add a notification to message-container
  const { username } = userObject;

  const chatMsgContainer = document.createElement('div');
  const chatInfo = document.createElement('span');

  chatMsgContainer.className = 'chat-msg-container';
  chatMsgContainer.style.margin = '1rem 0';
  chatInfo.className = 'chat-info';

  if (hasJoined) {
    chatMsgContainer.style.backgroundColor = '#4ab548';
    chatInfo.textContent = `${username} has joined! 😁`;
  } else {
    chatMsgContainer.style.backgroundColor = '#dc2539';
    chatInfo.textContent = `${username} has left! 😥`;
  }

  chatMsgContainer.appendChild(chatInfo);
  chatsContainer.appendChild(chatMsgContainer);
  chatsContainer.scrollTop = chatsContainer.scrollHeight ** 2;
});

socket.on('update-members-tab', (userObject, shouldAdd) => {
  if (shouldAdd) populatePeoplesContainer({ userObject });
  else removeFromPeoplesContainer(userObject);
});

socket.on('username-exists', () => {
  const modalCard = document.querySelector('.modal-card');
  const input = document.querySelector('.name-input');
  const label = document.querySelector('.name-label');
  const labelContent = document.querySelector('.label-content');
  const alertMsg = document.querySelector('.alert-msg');

  modalCard.classList.add('wrong-input-animate');
  input.disabled = true;
  label.classList.add('wrong-input');
  labelContent.classList.add('wrong-input');
  alertMsg.textContent =
    'Username already in the room please try another name!';

  setTimeout(() => {
    modalCard.classList.remove('wrong-input-animate');
    input.disabled = false;
  }, 1100);
});

socket.on('user-acknowledged', (myUsername, allUsersObject) => {
  // This is an acknowledgement event that is sent by the server
  // Which responds with the user object that was created
  // Now we can remove the modal
  // Update the members board with all the users, including me
  document.querySelector('.modal-container').remove();

  USERNAME = myUsername;

  // Populate the emoji board
  populateEmojiBoard();
  // Get giphy content
  getGiphyContent('trending');

  // Populating the members tab
  const { users } = allUsersObject;
  populatePeoplesContainer(users);
});

socket.on('notify-user-started-typing', (userWhoIsTyping) => {
  // Checking if this user typing element already exists
  const doesThisUserTypingExist = document.getElementById(
    `${userWhoIsTyping}-typing`
  );

  if (typingInfoContainer.children.length < 4 && !doesThisUserTypingExist) {
    const isTypingContainer = document.createElement('div');

    if (typingInfoContainer.children.length < 3) {
      const bounceDiv = document.createElement('div');

      isTypingContainer.className = 'is-typing-container';
      isTypingContainer.id = `${userWhoIsTyping}-typing`;
      isTypingContainer.textContent = `${userWhoIsTyping} is typing`;

      isTypingContainer.appendChild(bounceDiv);
      isTypingContainer.appendChild(bounceDiv.cloneNode(true));
      isTypingContainer.appendChild(bounceDiv.cloneNode(true));
    } else {
      isTypingContainer.id = 'other-users';
      isTypingContainer.textContent = 'and few others are typing!';
    }

    typingInfoContainer.appendChild(isTypingContainer);
  }
});

socket.on('notify-user-stopped-typing', (userWhoIsStoppedTyping) => {
  const userElement = document.getElementById(
    `${userWhoIsStoppedTyping}-typing`
  );

  if (userElement) {
    userElement.remove();

    // Checking if "others typing" text exist, if there we remove it so that new user who is typing can be added
    const checkLastElement = document.getElementById('other-users');
    if (checkLastElement) {
      checkLastElement.remove();
    }
  }
});

socket.on('new-chat-message', (message, userWhoSent, whenSent) => {
  addNewMessage(message, userWhoSent, whenSent, false, 'text');
});

socket.on('new-voice-message', (audio, userWhoSent, whenSent) => {
  const audioBlob = new Blob([audio]);
  const audioUrl = URL.createObjectURL(audioBlob);
  addNewMessage(audioUrl, userWhoSent, whenSent, false, 'audio');
});

socket.on('new-image-message', (image, userWhoSent, whenSent, isFile) => {
  let imageUrl = image;
  if (isFile) {
    const imageBlob = new Blob([image]);
    imageUrl = URL.createObjectURL(imageBlob);
  }

  addNewMessage(imageUrl, userWhoSent, whenSent, false, 'image');
});

// --------------------------------------------------------------------------------
// UTILITY FUNCTIONS

// This populates the members tab with the received user object
const populatePeoplesContainer = (users) => {
  Object.keys(users).forEach((user) => {
    const userStatus = document.createElement('div');
    const userPhoto = document.createElement('div');
    const userName = document.createElement('div');
    const span = document.createElement('span');
    const imgContainer = document.createElement('div');
    const img = document.createElement('img');

    userStatus.className = 'user-status';
    userPhoto.className = 'user-photo';
    imgContainer.className = 'peoples-profile-img-container';
    userName.className = 'user-name';

    userStatus.id = users[user].username;

    img.src = `./../profile-pics/${users[user].profileImgName}.svg`;

    if (+users[user].profileImgName === 0) {
      img.style.height = '70%';
      img.style.width = '70%';
    }

    img.alt = 'User Photo';

    span.textContent = users[user].username;

    imgContainer.appendChild(img);
    userPhoto.appendChild(imgContainer);
    userName.appendChild(span);
    userStatus.appendChild(userPhoto);
    userStatus.appendChild(userName);
    peopleContainer.appendChild(userStatus);
  });
};

// Remove member from Members tab
const removeFromPeoplesContainer = (userObject) => {
  const userElement = document.getElementById(userObject.username);

  userElement.remove();
};

// Populates the emoji board
const populateEmojiBoard = async () => {
  const loaderContainer = document.createElement('div');

  try {
    const loader = document.createElement('div');

    loaderContainer.className = 'loader-container';
    loader.className = 'loader';

    loaderContainer.appendChild(loader);
    emojiBoard.appendChild(loaderContainer);

    const response = await fetch(`${EMOJI_API_URL}`);
    const emojiData = await response.json();

    emojiContentElement.innerHTML = '';

    for (let i = 0; i < 259; i++) {
      if (
        !(
          i === 18 ||
          i === 21 ||
          i === 60 ||
          i === 162 ||
          i === 214 ||
          i === 215 ||
          (i >= 232 && i <= 238) ||
          i === 253 ||
          i === 256
        )
      ) {
        const emoji = document.createElement('span');

        emoji.className = 'emoji';
        emoji.textContent = `${emojiData[i].character}`;
        emoji.title = emojiData[i].unicodeName;

        emojiContentElement.appendChild(emoji);
      }
    }

    loaderContainer.remove();
  } catch (error) {
    console.error(error);

    loaderContainer.remove();
    emojiContentElement.innerHTML = `<p id='error-message' style="margin: 0 auto;">Sorry! something went wrong</p>`;
  }
};

// Populates the gif block
const getGiphyContent = async (endpoint, query) => {
  try {
    let apiUrl = `${GIPHY_API_URL}/${endpoint}?api_key=${GIPHY_API_KEY}&limit=${limit}`;

    if (query) {
      apiUrl += `&q=${query}`;

      while (
        gifContentElement.children.length > 1 &&
        gifContentElement.lastElementChild.tagName !== 'INPUT'
      ) {
        gifContentElement.lastElementChild.remove();
      }
    }

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.meta.status === 200 && data.data.length > 0) {
      data.data.forEach((gif) => {
        const gifImg = document.createElement('img');
        gifImg.className = 'gif-img';
        gifImg.src = gif.images.fixed_height.url;
        gifImg.alt = 'GIPHY';

        gifContentElement.appendChild(gifImg);
      });
    } else {
      gifContentElement.insertAdjacentHTML(
        'beforeend',
        '<p style="margin: 0 auto;">Opps! Found Nothing!</p>'
      );
    }
  } catch (err) {
    console.log(err);
    gifContentElement.insertAdjacentHTML(
      'beforeend',
      '<p style="margin: 0 auto;">Sorry! something went wrong</p>'
    );
  }
};

// Adds new message to DOM
const addNewMessage = (message, userWhoSent, whenSent, ownMsg, msgType) => {
  // Add the new message to the chats container
  const chatMsgContainer = document.createElement('div');
  const chatMsgUserInfo = document.createElement('span');
  const chatMessage = document.createElement('span');

  chatMsgContainer.className = 'chat-msg-container';
  chatMsgUserInfo.className = 'chat-msg-user-info';
  chatMsgUserInfo.style.alignSelf = ownMsg ? 'flex-end' : 'flex-start';
  chatMessage.className = ownMsg ? 'chat-msg-mine' : 'chat-msg-others';

  const date = new Date(whenSent);

  // If input is a text
  if (msgType === 'text') {
    chatMessage.textContent = message;

    // When input is a audio
  } else if (msgType === 'audio') {
    const audioElement = document.createElement('audio');

    audioElement.className = 'audio-msg';
    audioElement.src = message;
    audioElement.controls = true;

    if (ownMsg) audioElement.play();

    chatMessage.style.backgroundColor = 'transparent';
    chatMessage.appendChild(audioElement);

    // When input is an image
  } else if (msgType === 'image') {
    const imgElement = document.createElement('img');

    imgElement.className = 'image-msg';
    imgElement.src = message;

    chatMessage.style.backgroundColor = 'transparent';
    chatMessage.appendChild(imgElement);
  }

  chatMsgUserInfo.textContent = `${userWhoSent} | ${date.getHours()}:${date.getMinutes()}`;

  chatMsgContainer.appendChild(chatMsgUserInfo);
  chatMsgContainer.appendChild(chatMessage);

  chatsContainer.appendChild(chatMsgContainer);
  chatsContainer.scrollTop = chatMsgContainer.scrollHeight ** 2;
};

// Display the modal on page loading
window.onload = async () => {
  // First display the modal to ask the username
  // createModal('user-registration');
  const status = displayTheModal();

  if (status) {
    const nameInput = document.querySelector('.name-input');
    const doneBtn = document.querySelector('.done-btn');
    const profilePic = document.getElementById('profile-pic');

    doneBtn.onclick = () => {
      // Emmiting the event that a new user has requested to join the room

      if (nameInput.value.trim().length > 0) {
        socket.emit(
          'new-user',
          nameInput.value.trim(),
          profilePic.getAttribute('img-number')
        );
      }
    };
  }
};

window.onbeforeunload = () => {
  socket.emit('user-stopped-typing');
  isTyping = false;
};
