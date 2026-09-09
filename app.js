const form = document.querySelector("#review-form");
const status = document.querySelector("#form-status");
const contact = window.GrowthSystemsContact || {};

function requestText(data) {
  const subject = `Growth Systems review request: ${data.get("business")}`;
  const body = [
    `Name: ${data.get("name")}`,
    `Business: ${data.get("business")}`,
    `Email: ${data.get("email")}`,
    `Role: ${data.get("role") || "Not provided"}`,
    `Website: ${data.get("website") || "Not provided"}`,
    `Focus: ${data.get("focus") || "Not provided"}`,
    `Decision timing: ${data.get("timing") || "Not provided"}`,
    "",
    `Condition: ${data.get("condition")}`,
    "",
    `Useful next decision: ${data.get("decision")}`,
    "",
    `Page: ${data.get("page") || window.location.href}`,
    `Referrer: ${data.get("referrer") || document.referrer || "Direct"}`,
  ].join("\n");
  return { subject, body };
}

if (form && status) form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  if (data.get("website_confirm")) return;
  data.set("page", window.location.href);
  data.set("referrer", document.referrer || "Direct");
  const { subject, body } = requestText(data);

  if ((contact.formEndpoint || "").startsWith("https://")) {
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

  if ((contact.contactEmail || "").includes("@")) {
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

const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector("#site-navigation");

if (menuToggle && siteNavigation) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    siteNavigation.classList.toggle("is-open", !open);
    document.body.classList.toggle("menu-open", !open);
  });
  siteNavigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNavigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }));
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
}

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let ringX = 0;
  let ringY = 0;
  let targetX = 0;
  let targetY = 0;

  const drawCursor = () => {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    window.requestAnimationFrame(drawCursor);
  };

  window.addEventListener("pointermove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    dot.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });
  document.querySelectorAll("a, button, input, textarea").forEach((item) => {
    item.addEventListener("pointerenter", () => ring.classList.add("is-active"));
    item.addEventListener("pointerleave", () => ring.classList.remove("is-active"));
  });
  document.querySelectorAll("[data-magnetic]").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const box = item.getBoundingClientRect();
      const x = (event.clientX - box.left - box.width / 2) * 0.12;
      const y = (event.clientY - box.top - box.height / 2) * 0.12;
      item.style.transform = `translate(${x}px, ${y}px)`;
    });
    item.addEventListener("pointerleave", () => { item.style.transform = ""; });
  });
  drawCursor();
}
