document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  const nameInput = document.getElementById("name");
  const messageDiv = document.getElementById("message");
  const keyDisplay = document.getElementById("keyDisplay");

  // Utility: Show messages
  const showMessage = (text, color = "black") => {
    messageDiv.textContent = text;
    messageDiv.style.color = color;
  };

  // Utility: Convert ArrayBuffer to base64
  const bufferToBase64 = (buffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)));

  // Utility: Convert base64 to ArrayBuffer
  const base64ToBuffer = (base64) =>
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  // Utility: Get all users stored in localStorage
  const getUserStore = () =>
    JSON.parse(localStorage.getItem("registeredUsers") || "{}");

  // Utility: Save user data to localStorage
  const setUserStore = (store) =>
    localStorage.setItem("registeredUsers", JSON.stringify(store));

  // REGISTER FINGERPRINT
  registerBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) {
      showMessage("Please enter a name.", "red");
      return;
    }

    try {
      // Generate credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "RescuePrint" },
          user: {
            id: new TextEncoder().encode(crypto.randomUUID()),
            name: `${name}@rescueprint`,
            displayName: name,
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { authenticatorAttachment: "platform" },
          timeout: 60000,
          attestation: "direct",
        },
      });

      // Convert rawId to base64
      const rawId = credential.rawId;
      const credentialId = bufferToBase64(rawId);
      const users = getUserStore();

      if (users[credentialId]) {
        showMessage("This fingerprint is already registered.", "orange");
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

// Additional WebAuthn registration and login code

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

      // Prompt fingerprint login
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials,
          timeout: 60000,
        },
      });

      const credentialId = bufferToBase64(assertion.rawId);
      const user = users[credentialId];

      if (user) {
        showMessage(`Welcome back, ${user.name}`, "green");
        keyDisplay.textContent = `Logged in as ${user.name}\nCredential ID: ${credentialId}`;
      } else {
        showMessage("User not recognized.", "red");
      }
    } catch (err) {
      console.error("Login failed:", err);
      showMessage("Fingerprint login failed.", "red");
    }
  });
});
