const form = document.querySelector("#dispatch-form");
const scoreFields = [...document.querySelectorAll(".score")];
const sendStatus = document.querySelector("#send-status");
const actionStatus = document.querySelector("#action-status");
const offer = document.querySelector("#offer");
const pricing = document.querySelector("#pricing");
const currency = document.querySelector("#currency");

const catalog = {
  signal: { name: "System Signal Review", days: "Two working days", local: ["KES 15,000", "KES 20,000"], international: ["USD 250", "USD 300"], credit: "Fully credited toward an agreed deeper assessment within seven days" },
  diagnostic: { name: "Growth System Diagnostic", days: "Five working days", local: ["KES 35,000", "KES 50,000"], international: ["USD 750", "USD 950"], credit: "KES 20,000 / USD 500 implementation credit within 14 days" },
  operations: { name: "Client Operations Flow Blueprint", days: "Five working days", local: ["KES 35,000", "KES 50,000"], international: ["USD 750", "USD 950"], credit: "KES 20,000 / USD 500 implementation credit within 14 days" },
};

function getData() { return Object.fromEntries(new FormData(form)); }
function offerDetails() {
  const details = catalog[offer.value];
  const amount = currency.value === "KES" ? details.local : details.international;
  return { ...details, price: pricing.value === "launch" ? amount[0] : amount[1] };
}
function updateOffer() {
  const details = offerDetails();
  document.querySelector("#offer-timeline").textContent = details.days;
  document.querySelector("#offer-price").textContent = details.price;
  document.querySelector("#offer-credit").textContent = details.credit;
}
function updateScore() {
  const scores = scoreFields.map((field) => Number(field.value));
  const total = scores.reduce((sum, score) => sum + score, 0);
  const ready = total >= 8 && scores.every((score) => score >= 1);
  sendStatus.textContent = ready ? `${total}/10. Send authority earned. Complete a final live-evidence check before dispatch.` : `${total}/10. Continue research before sending.`;
  sendStatus.classList.toggle("ready", ready);
  return { total, ready };
}
function requireComplete() {
  if (!form.reportValidity()) { actionStatus.textContent = "Complete the required account fields first."; return false; }
  if (!updateScore().ready) { actionStatus.textContent = "Do not create a dispatch until send authority is earned."; return false; }
  return true;
}
function message(data, details) {
  const name = data.buyer.split(" ")[0] || data.buyer;
  return `Hi ${name},\n\nI looked at ${data.business} because ${data.moment.toLowerCase()} One thing that stood out is ${data.condition} ${data.consequence} I may be missing context, so I would not treat that observation as a diagnosis.\n\nI run a ${details.days.toLowerCase()} ${details.name} that traces the relevant path, identifies the highest-value constraint, and gives a fixed next decision. The ${pricing.value === "launch" ? "current launch-client" : "standard"} investment is ${details.price}.\n\nWould you like me to send the one-page scope?`;
}
function accountBrief(data, details, score) {
  return `# ${data.business.toUpperCase()}: GATE 1 ACCOUNT BRIEF\n\n## Account Identity\n\n- **Business:** ${data.business}\n- **Decision-maker:** ${data.buyer}\n- **Direct professional route:** ${data.route}\n- **Evidence:** ${data.evidence}\n- **Research date:** ${data.researchDate}\n\n## Buyer Condition\n\n- **Observed condition:** ${data.condition}\n- **Bounded consequence:** ${data.consequence}\n- **Current trigger:** ${data.moment}\n- **Evidence boundary:** ${data.limit}\n\n## Recommended Entry Offer\n\n- **Offer:** ${details.name}\n- **Timeline:** ${details.days}\n- **Investment:** ${details.price} (${pricing.value}-client)\n- **Credit:** ${details.credit}\n\n## Send Authority\n\n| Control | Score |\n|---|---:|\n| Target | ${data.target}/2 |\n| Contact | ${data.contact}/2 |\n| Moment | ${data.timing}/2 |\n| Approach | ${data.approach}/2 |\n| Method | ${data.method}/2 |\n| **Total** | **${score.total}/10** |\n\n**Status:** ${score.ready ? "Send authority earned. Re-check live evidence immediately before dispatch." : "Not send-ready. Continue research."}\n\n## Permission-First Draft\n\n> ${message(data, details).replaceAll("\n", "\n> ")}\n`;
}
async function copyMessage() {
  if (!requireComplete()) return;
  const text = message(getData(), offerDetails());
  try { await navigator.clipboard.writeText(text); actionStatus.textContent = "Permission-first message copied. Review each fact against the live evidence before sending."; }
  catch { actionStatus.textContent = "Copy failed. Use the downloaded brief to retrieve the prepared message."; }
}
function downloadBrief() {
  if (!requireComplete()) return;
  const data = getData(); const details = offerDetails(); const content = accountBrief(data, details, updateScore());
  const blob = new Blob([content], { type: "text/markdown" }); const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = `${data.business.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-gate-1-brief.md`; link.click(); URL.revokeObjectURL(url);
  actionStatus.textContent = "Account brief downloaded. Move it into the project only after reviewing its facts.";
}

[offer, pricing, currency].forEach((field) => field.addEventListener("change", updateOffer));
scoreFields.forEach((field) => field.addEventListener("change", updateScore));
form.addEventListener("reset", () => window.setTimeout(() => { updateOffer(); updateScore(); actionStatus.textContent = ""; }, 0));
document.querySelector("#copy-message").addEventListener("click", copyMessage);
document.querySelector("#download-brief").addEventListener("click", downloadBrief);
document.querySelector("[name='researchDate']").value = new Date().toISOString().slice(0, 10);
updateOffer(); updateScore();
