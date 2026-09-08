const form = document.querySelector("#review-form");
const status = document.querySelector("#form-status");
const contact = window.GrowthSystemsContact || {};

function requestText(data) {
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
  return { subject, body };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const { subject, body } = requestText(data);

  if (contact.formEndpoint.startsWith("https://")) {
    status.textContent = "Sending your review request...";
    try {
      const response = await fetch(contact.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Request was not accepted.");
      form.reset();
      status.textContent = `Your request has been received${contact.legalBusinessName ? ` by ${contact.legalBusinessName}` : ""}. We will review the condition before recommending a next step.`;
      return;
    } catch {
      status.textContent = "The request could not be sent. Please use the contact route provided by the business.";
      return;
    }
  }

  if (contact.contactEmail.includes("@")) {
    window.location.href = `mailto:${encodeURIComponent(contact.contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Your email client is opening with the completed request.";
    return;
  }

  try {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    status.textContent = "Your review request is prepared and copied. Send it to the Growth Systems contact channel to begin qualification.";
  } catch {
    status.textContent = "Your request is ready. Copy the details from the completed form and send them to the Growth Systems contact channel.";
  }
});
