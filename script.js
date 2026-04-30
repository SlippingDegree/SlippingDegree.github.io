const form = document.getElementById("form");
const statusBox = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.textContent = "Submitting...";

  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch("https://hook.eu1.make.com/36c18or2ar7vx28ac3llumkb2dvlfc53", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      statusBox.textContent = "Submitted successfully.";
      form.reset();
    } else {
      statusBox.textContent = "Submission failed.";
    }
  } catch (err) {
    statusBox.textContent = "Network error.";
  }
});
