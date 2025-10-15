# 📖 Frequently Asked Questions (FAQ)

A warm welcome! Here are some answers to common questions from new users and contributors of Responsively App. If you're still stuck, feel free to [open an issue](https://github.com/responsively-org/responsively-app/issues) or reach out on our Discord!

---

### 📌 Does Responsively App require an internet connection?

Nope! The app works completely offline since it's built using Electron. However, the websites you load inside it may require internet access based on their content.

---

### 📱 How can I add or customize device profiles?

Responsively App comes with 30+ built-in devices, but you can:
- Click on the **Device Settings icon** in the toolbar
- Choose **“Custom Devices”**
- Add your desired device size, name, and type

This makes it easier to simulate real-world testing conditions!

---

### 🔄 Some websites won’t load correctly — why?

There are a few common causes:
- **CORS errors** when websites don’t allow being embedded in iframes
- **Firewalls or VPNs** blocking certain requests
- **Content Security Policies (CSP)** of the websites you're testing

If you're testing a local site, make sure your server has proper headers (like `Access-Control-Allow-Origin`).

---

### 🆚 How is this better than Chrome DevTools?

While Chrome DevTools is powerful, it shows only one device view at a time.

Responsively App allows:
- **Multiple synchronized devices at once**
- **Mirrored interactions**
- One-click screenshots
- Device layout customization
This is great for front-end developers working on responsive UIs.

---

### 🔥 Does it support hot-reloading?

Yes! If your local development environment (like React, Vue, Vite, etc.) supports hot-reloading, the changes will instantly reflect in Responsively too.

---

### 🌐 Can I preview localhost or local development servers?

Definitely. Just:
1. Start your local server (e.g., `http://localhost:3000`)
2. Open Responsively App
3. Enter the URL in the address bar

Make sure you don’t have any firewalls blocking it.

---

### 🔧 Where can I report bugs or feature suggestions?

You can open a new issue in the [GitHub Issues section](https://github.com/responsively-org/responsively-app/issues). Try searching existing issues first — your question might already be answered!

---

### 💬 Is there a community or discussion forum?

Yes! Join the [Responsively Discord server](https://discord.gg/gMT5JpB) to chat with contributors, ask questions, and discuss features. It’s a welcoming space!

---

### 🧑‍💻 I want to contribute! Where should I start?

Awesome! Here's a simple roadmap:
1. Read the [`CONTRIBUTING.md`](./CONTRIBUTING.md) guidelines
2. Check [Good First Issues](https://github.com/responsively-org/responsively-app/issues?q=is%3Aissue+is%3Aopen+label%3Agood+first+issue)
3. Make your PR — we’re happy to help if you get stuck!

Don’t forget to add yourself to the `.all-contributorsrc` if your PR gets merged 🌸

---

### 📥 Can I use browser extensions with Responsively App?

Not directly — it’s a custom Electron-based browser. But many built-in features cover what popular extensions offer. You can also suggest features you want to see added.

---

### 💡 Where can I learn about upcoming features?

Check out the [project roadmap](https://github.com/responsively-org/responsively-app/projects) to stay updated. You can also follow [Responsively on Twitter](https://twitter.com/responsivelyapp) for news.

---

### 🖥️ Does Responsively App work on all OS platforms?

Yes! It supports:
- ✅ Windows
- ✅ macOS
- ✅ Linux (deb/rpm/AppImage)

You can download it from the [official website](https://responsively.app/#download).

---

> Have a suggestion to improve this FAQ? Open a PR — we’d love to hear from you!
