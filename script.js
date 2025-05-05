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

      // Store user in localStorage
      users[credentialId] = { name, credentialId };
      setUserStore(users);

      showMessage(`Registered successfully as ${name}`, "green");
      keyDisplay.textContent = `Public Key (Credential ID): ${credentialId}`;
    } catch (err) {
      console.error("Registration failed:", err);
      showMessage("Fingerprint registration failed.", "red");
    }
  });

  // LOGIN USING FINGERPRINT
  loginBtn.addEventListener("click", async () => {
    try {
      const users = getUserStore();
      const allowCredentials = Object.keys(users).map((credId) => ({
        type: "public-key",
        id: base64ToBuffer(credId),
      }));

      if (allowCredentials.length === 0) {
        showMessage("No users registered yet.", "red");
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
