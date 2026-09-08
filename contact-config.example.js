/*
 * Copy these verified values into contact-config.local.js for local testing,
 * then make an intentional production configuration decision. Do not add
 * access tokens, payment credentials, wallet addresses, or personal accounts.
 */
window.GrowthSystemsContact = {
  // A verified HTTPS form or CRM endpoint that accepts the posted form fields.
  formEndpoint: "https://example.com/your-verified-form-endpoint",
  // Used only if no endpoint is configured. Must be a monitored business inbox.
  contactEmail: "hello@yourdomain.example",
  // Used in request confirmations once legal identity is confirmed.
  legalBusinessName: "Your legal business name",
};
