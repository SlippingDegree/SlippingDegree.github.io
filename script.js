const form = document.getElementById("form");
const statusBox = document.getElementById("status");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  statusBox.textContent = "Submitting...";

  const formData = new FormData(form);

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    deadline: formData.get("deadline"),
    type: formData.get("type"),
    notes: formData.get("notes")
  };

  try {
    const res = await fetch("https://hook.eu1.make.com/36c18or2ar7vx28ac3llumkb2dvlfc53", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const text = await res.text();

    console.log("Make response:", text);

    if (res.ok) {
      statusBox.textContent = "Submitted successfully!";
      form.reset();
    } else {
      statusBox.textContent = "Submission failed. Check console.";
    }

  } catch (err) {
    console.error(err);
    statusBox.textContent = "Network error. Check console.";
  }
});
