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
