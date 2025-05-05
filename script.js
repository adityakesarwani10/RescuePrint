function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}

async function registerWithFingerprint() {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Enter your name first!");

  const publicKeyOptions = {
    challenge: new Uint8Array(32),
    rp: { name: "RescuePrint" },
    user: {
      id: new Uint8Array(16),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    timeout: 60000,
    attestation: "direct",
  };

  try {
    const credential = await navigator.credentials.create({ publicKey: publicKeyOptions });
    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));

    const newUser = {
      username,
      credentialId,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);

    document.getElementById("status").innerText = `Fingerprint registered successfully for ${username}`;
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Registration failed.";
  }
}

async function loginWithFingerprint() {
  const users = getUsers();
  if (users.length === 0) return alert("No users found. Please register first.");

  const publicKey = {
    challenge: new Uint8Array(32),
    allowCredentials: users.map(user => ({
      type: "public-key",
      id: Uint8Array.from(atob(user.credentialId), c => c.charCodeAt(0)).buffer
    })),
    timeout: 60000,
    userVerification: "preferred"
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    const credentialId = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));

    const matchedUser = users.find(user => user.credentialId === credentialId);

    if (matchedUser) {
      document.getElementById("status").innerText = `✅ Welcome back, ${matchedUser.username}!`;
    } else {
      document.getElementById("status").innerText = "❌ No matching fingerprint found.";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Fingerprint login failed.";
  }
}
