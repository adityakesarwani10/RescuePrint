document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form.glassmorphism");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate password and confirm password match
    if (data.password !== data["confirm password"] && data["confirm password"] !== undefined) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok) {
        console.log("Registration script loaded successfully.");
        alert(result.message || "Registration successful!");
        // Redirect to Aadhar page after success
        window.location.href = "../Aadhar/aadhar.html";
      } else {
        alert(result.message || result.error || "Registration failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });
});