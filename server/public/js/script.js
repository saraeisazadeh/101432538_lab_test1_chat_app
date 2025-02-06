document.getElementById('join-chat')?.addEventListener('click', () => {
  const room = prompt('Enter the room name (e.g., devops, cloud, sports):');
  if (room) {
    localStorage.setItem('room', room); 
    window.location.href = '/chat'; 
  }
});

// Socket.io connection
const socket = io();

const username = localStorage.getItem('username') || 'User';
const room = localStorage.getItem('room') || 'devops'; // Default room if none is set
socket.emit('joinRoom', { username, room });

document.getElementById('send-button')?.addEventListener('click', () => {
  const message = document.getElementById('message-input').value;
  if (message.trim()) {
    socket.emit('sendMessage', { room, message });
    document.getElementById('message-input').value = '';
  }
});

socket.on('message', (message) => {
  const chatWindow = document.getElementById('chat-window');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  if (message.user === 'admin') {
    messageElement.classList.add('admin');
    messageElement.textContent = `${message.text}`;
  } else if (message.from_user === username) {
    messageElement.classList.add('user');
    messageElement.textContent = `You: ${message.message}`;
  } else {
    messageElement.textContent = `${message.from_user}: ${message.message}`;
  }
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Typing indicator
document.getElementById('message-input')?.addEventListener('input', () => {
  socket.emit('typing', { username, room });
});

socket.on('typing', (typingMessage) => {
  const chatWindow = document.getElementById('chat-window');
  const typingElement = document.createElement('div');
  typingElement.textContent = typingMessage;
  chatWindow.appendChild(typingElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Leave room
document.getElementById('leave-chat')?.addEventListener('click', () => {
  socket.emit('leaveRoom', { username, room });
  localStorage.removeItem('room'); // Clear the room from local storage
  window.location.href = '/login.html'; // Redirect to the login page
});

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, firstname, lastname, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Signup successful! Please login.');
      window.location.href = '/login.html';
    } else {
      alert(data.error);
    }
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('username', username);
      window.location.href = '/chat.html';
    } else {
      alert(data.error);
    }
  });
}