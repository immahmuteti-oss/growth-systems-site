# Public Site Deployment

This folder is designed to be published alone as the public Growth Systems site. It intentionally excludes the private Gravity Engine operating records, prospect research, pricing research, payment policy, and client evidence.

The bundled GitHub Actions workflow deploys the folder to GitHub Pages on every `main` push in the public-site repository. GitHub Pages is static hosting: it can host the interface, three-dimensional scene, navigation, pages, and configured form front end, but it is not an application backend.

Before enabling live intake, configure `contact-config.js` with either a verified HTTPS form endpoint or a monitored business email. Never add API keys, payment credentials, personal wallet information, or private client information to this public repository.
