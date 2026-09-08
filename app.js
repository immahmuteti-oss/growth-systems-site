const form = document.querySelector("#review-form");
const status = document.querySelector("#form-status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = `Growth Systems review request: ${data.get("business")}`;
  const body = [
    `Name: ${data.get("name")}`,
    `Business: ${data.get("business")}`,
    `Email: ${data.get("email")}`,
    "",
    `Condition: ${data.get("condition")}`,
    "",
    `Useful next decision: ${data.get("decision")}`,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    status.textContent = "Your review request is prepared and copied. Send it to the Growth Systems contact channel to begin qualification.";
  } catch {
    status.textContent = "Your request is ready. Copy the details from the completed form and send them to the Growth Systems contact channel.";
  }
});
