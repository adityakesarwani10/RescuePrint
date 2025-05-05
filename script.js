const encoder = new TextEncoder();
const decoder = new TextDecoder();

const $username = document.getElementById('username');
const $register = document.getElementById('register');
const $login = document.getElementById('login');
const $publicKeyDisplay = document.getElementById('publicKeyDisplay');
const $loginResult = document.getElementById('loginResult');

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUser(newUser) {
  const users = getUsers();

  // Check for existing username
  const existingUser = users.find(u => u.username === newUser.username);
  if (existingUser) return false;

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return true;
}

$register.addEventListener('click', async () => {
  const username = $username.value.trim();
  if (!username) return alert('Please enter your name');

  if (getUsers().some(u => u.username === username)) {
    return alert('User already registered');
  }

  const publicKey = {
    challenge: Uint8Array.from('challenge-string', c => c.charCodeAt(0)),
    rp: { name: 'RescuePrint' },
    user: {
      id: encoder.encode(username),
      name: username,
      displayName: username
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },
      { type: 'public-key', alg: -257 }
    ]
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    const id = bufferToBase64(credential.rawId);

    $publicKeyDisplay.innerText = `Public Key (Credential ID): ${id}`;

    const userObject = {
      username,
      credentialId: id,
      createdAt: new Date().toISOString()
    };

    if (saveUser(userObject)) {
      alert('Fingerprint registered successfully');
    } else {
      alert('User already exists');
    }

  } catch (err) {
    console.error(err);
    alert('Registration failed');
  }
});

$login.addEventListener('click', async () => {
  const users = getUsers();
  if (!users.length) return alert('No registered users');

  const allowCredentials = users.map(user => ({
    id: base64ToBuffer(user.credentialId),
    type: 'public-key'
  }));

  const publicKey = {
    challenge: Uint8Array.from('random-login-challenge', c => c.charCodeAt(0)),
    allowCredentials
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    const id = bufferToBase64(assertion.rawId);
    const matchedUser = users.find(u => u.credentialId === id);

    if (matchedUser) {
      $loginResult.innerText = `✅ Welcome back, ${matchedUser.username}!`;
    } else {
      $loginResult.innerText = '❌ No matching user found';
    }
  } catch (err) {
    console.error(err);
    alert('Authentication failed');
  }
});
