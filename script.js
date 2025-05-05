const statusBox = document.getElementById("finger-status");

function showStatus(message, type = "success") {
  statusBox.textContent = message;
  statusBox.className = `status-box ${type}`;
}

function bufferFromString(str) {
  return Uint8Array.from(str, c => c.charCodeAt(0));
}

async function registerFingerprint() {
  const publicKey = {
    challenge: bufferFromString("register-challenge"),
    rp: { name: "RescuePrint" },
    user: {
      id: bufferFromString("user-id"),
      name: "aditya@example.com",
      displayName: "Aditya"
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    },
    timeout: 60000,
    attestation: "direct"
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    showStatus("✅ Fingerprint scanned and registered successfully!", "success");
    console.log("Credential:", credential);
    localStorage.setItem("credentialId", btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
  } catch (err) {
    console.error(err);
    showStatus("❌ Registration failed. Fingerprint not scanned.", "error");
  }
}

async function loginFingerprint() {
  const credentialId = localStorage.getItem("credentialId");
  if (!credentialId) {
    showStatus("⚠️ No fingerprint registered. Please register first.", "warning");
    return;
  }

  const publicKey = {
    challenge: bufferFromString("login-challenge"),
    allowCredentials: [{
      type: "public-key",
      id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
      transports: ["internal"]
    }],
    timeout: 60000,
    userVerification: "required"
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    showStatus("✅ Fingerprint scanned and verified successfully!", "success");
    console.log("Assertion:", assertion);
  } catch (err) {
    console.error(err);
    showStatus("❌ Authentication failed. Fingerprint not scanned.", "error");
  }
}

// Convert buffer to base64 string
function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Save a fake user object in localStorage (simulate registration)
function saveUser(credentialId) {
  let users = JSON.parse(localStorage.getItem("webauthn_users")) || [];
  users.push({ credentialId });
  localStorage.setItem("webauthn_users", JSON.stringify(users));
}

// Get registered users
function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem("webauthn_users")) || [];
}

// Register
document.getElementById("registerBtn").addEventListener("click", async () => {
  const publicKey = {
    challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
    rp: { name: "RescuePrint Demo" },
    user: {
      id: Uint8Array.from(String(Date.now()), c => c.charCodeAt(0)),
      name: "demo_user_" + Date.now(),
      displayName: "Demo User"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
    timeout: 60000,
    attestation: "direct"
  };

  try {
    const credential = await navigator.credentials.create({ publicKey });
    const credentialId = bufferToBase64(credential.rawId);
    document.getElementById("status").innerText = "✅ Registration successful";
    document.getElementById("publicKey").value = credentialId;
    saveUser(credentialId);
  } catch (err) {
    document.getElementById("status").innerText = "❌ Registration failed: " + err.message;
  }
});

// Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  const users = getRegisteredUsers();
  if (users.length === 0) {
    alert("No users registered. Please register first.");
    return;
  } 

  const allowCredentials = users.map(user => ({
    type: "public-key",
    id: Uint8Array.from(atob(user.credentialId), c => c.charCodeAt(0))
  }));

  const publicKey = {
    challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
    allowCredentials,
    timeout: 60000,
    userVerification: "required"
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    const credentialId = bufferToBase64(assertion.rawId);
    document.getElementById("status").innerText = "✅ Login successful";
    document.getElementById("publicKey").value = credentialId;
  } catch (err) {
    document.getElementById("status").innerText = "❌ Login failed: " + err.message;
  }
});
