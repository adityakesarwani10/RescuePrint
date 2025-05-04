document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("register-fingerprint");
  const output = document.getElementById("publicKeyOutput");

  registerBtn.addEventListener("click", async () => {
    try {
      const challengeBuffer = new Uint8Array(32);
      window.crypto.getRandomValues(challengeBuffer);

      const publicKey = {
        challenge: challengeBuffer,
        rp: { name: "RescuePrint" },
        user: {
          id: new TextEncoder().encode("unique-user-id"),
          name: "user@example.com",
          displayName: "User Name",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "direct",
      };

      const credential = await navigator.credentials.create({ publicKey });

      if (credential) {
        const publicKeyId = btoa(
          String.fromCharCode(...new Uint8Array(credential.rawId))
        );
        output.textContent =
          "Public Key (Credential ID): " + publicKeyId;
      }
    } catch (err) {
      console.error("Registration failed", err);
      alert("Fingerprint registration failed or canceled.");
    }
  });
});
