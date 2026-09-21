🛠️ Troubleshooting

A guide to common problems you may run into while using Responsively App and how to resolve them.


📑 Table of Contents

🚀 Installation Issues
⚡ Runtime Issues
📸 Screenshot Issues
🧰 Build & Development Issues
🆘 Still Stuck?


🚀 Installation Issues
<details>
<summary><strong>The app won't launch on Linux (sandbox error)</strong></summary>
If you see an error similar to:
textThe SUID sandbox helper binary was found, but is not configured correctly.
this is a known AppImage permission issue on certain Linux distributions.

[!TIP]
Fix — choose one:

Run the AppImage with the --no-sandbox flag, or
Extract the AppImage and adjust permissions on the chrome-sandbox binary so it is owned by root with mode 4755.


</details>
<details>
<summary><strong>Installation fails on Node.js v24</strong></summary>
When building from source, you may see ERR_MODULE_NOT_FOUND errors during yarn install or yarn dev. The Webpack configuration in this project is not yet fully compatible with Node.js v24.

[!WARNING]
Node.js v24 is not currently supported for building this project from source.


[!TIP]
Fix: Use Node.js v18 or v20 LTS. You can manage versions easily with:

nvm
fnm


</details>

⚡ Runtime Issues
<details>
<summary><strong>Pages aren't refreshing when I edit my CSS</strong></summary>
If hot-reload isn't picking up your changes, the most common causes are listed below.
CauseFixCached CSS in the previewHard refresh: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (macOS)Dev server isn't emitting reload eventsVerify it's running and logs file changes when CSS is editedPage uses Shadow DOM (Web Components / Polymer)The Live CSS editor and event mirroring have known limitations inside Shadow DOM
</details>
<details>
<summary><strong><code>ERR_CERT_AUTHORITY_INVALID</code> when loading an internal/staging site</strong></summary>
If your staging or internal site uses a self-signed or untrusted certificate, Responsively will block it for security reasons.

[!TIP]
Fix:

Open User Preferences.
Toggle on Disable SSL Validation.
Reload the page.
If the error persists, restart the app after toggling the setting.


</details>
<details>
<summary><strong><code>ERR_SSL_PROTOCOL_ERROR</code> on a site without HTTPS</strong></summary>
This error appears when Responsively tries to upgrade an http:// URL to https:// but the site does not support it.

[!TIP]
Fix: Make sure you typed the full URL with the correct protocol. For example, instead of:
textexample.com
explicitly enter:
texthttp://example.com

</details>
<details>
<summary><strong>Typing the letter "F" triggers full-screen mode</strong></summary>
Earlier versions of Responsively had a global F shortcut that could fire while typing in input fields.

[!NOTE]
Fixed in v1.18.0. Update to the latest release of Responsively App.

</details>

📸 Screenshot Issues
<details>
<summary><strong>Screenshots are saved as blank images</strong></summary>
If your full-page screenshots come out blank or black, the screenshot output folder may have a permissions problem.

[!TIP]
Fix:

Open User Preferences in the left sidebar.
Change Screenshot Location to a folder you have write access to (e.g. your Desktop).
Try the screenshot again.


</details>
<details>
<summary><strong>Third-party screenshot apps trigger Responsively's screenshot</strong></summary>
If your system screenshot shortcut also triggers Responsively to capture all devices, your shortcuts are colliding.

[!TIP]
Fix: Either change your system screenshot shortcut, or rebind Responsively's shortcut in your operating system's keyboard shortcut settings.

</details>

🧰 Build & Development Issues
<details>
<summary><strong><code>yarn dev</code> says modules are not found</strong></summary>
This usually means your dependencies were not installed cleanly.

[!TIP]
Fix — from inside the desktop-app directory:
bashrm -rf node_modules yarn.lock
yarn install
yarn dev

</details>
<details>
<summary><strong><code>yarn</code> is not recognized as a command</strong></summary>
You need Yarn installed before running development commands.

[!TIP]
Fix:
bashnpm install -g yarn
yarn --version
The second command should print a version number, confirming the install worked.

</details>

🆘 Still Stuck?
If your problem isn't listed here, try the following in order:
StepAction1️⃣Search the issues — your problem may already have a fix2️⃣Open a new issue with your OS, app version (Help → About → Copy), and a clear description3️⃣Join the Responsively Discord for community help
