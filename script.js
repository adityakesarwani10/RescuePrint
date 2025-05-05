async function register() {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Please enter a username.");

  const existingKeys = JSON.parse(localStorage.getItem("webauthn_users") || "[]");

  const publicKeyOptions = {
    challenge: Uint8Array.from("random-challenge-123", c => c.charCodeAt(0)),
    rp: { name: "RescuePrint" },
    user: {
      id: Uint8Array.from(username, c => c.charCodeAt(0)),
      name: username,
      displayName: username
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    authenticatorSelection: { userVerification: "preferred" },
    timeout: 60000,
    attestation: "direct"
  };

  try {
    const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });

    const publicKey = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));

    const userExists = existingKeys.find(user => user.key === publicKey);
    if (userExists) {
      document.getElementById("status").textContent = "User already registered.";
      return;
    }

    existingKeys.push({ username, key: publicKey });
    localStorage.setItem("webauthn_users", JSON.stringify(existingKeys));

    document.getElementById("publicKeyDisplay").textContent = `Public Key (Credential ID): ${publicKey}`;
    document.getElementById("status").textContent = "Registration successful!";
  } catch (err) {
    console.error(err);
    alert("Registration failed.");
  }
}

async function login() {
  const existingKeys = JSON.parse(localStorage.getItem("webauthn_users") || "[]");
  if (existingKeys.length === 0) return alert("No registered users.");

  const allowedCredentials = existingKeys.map(user => ({
    type: "public-key",
    id: Uint8Array.from(atob(user.key), c => c.charCodeAt(0)),
    transports: ["internal"]
  }));

  const publicKeyRequestOptions = {
    challenge: Uint8Array.from("random-login-challenge", c => c.charCodeAt(0)),
    allowCredentials: allowedCredentials,
    userVerification: "preferred",
    timeout: 60000
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey: publicKeyRequestOptions });

    const key = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));
    const matched = existingKeys.find(user => user.key === key);

    if (matched) {
      document.getElementById("status").textContent = `Login successful! Welcome ${matched.username}`;
    } else {
      document.getElementById("status").textContent = "Login failed. Unknown fingerprint.";
    }
  } catch (err) {
    console.error(err);
    alert("Login failed.");
  }
}
