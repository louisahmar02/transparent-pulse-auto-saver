# 🎓 Transparent Pulse Auto-Saver

An automated Chrome Extension (Manifest V3) that detects completed test scorecards on Transparent Pulse, intercepts generated PDF certificates, and automatically syncs them directly to Google Drive.

---

## 🚀 Features
- **CSP Bypass:** Runs a main-world script interceptor to catch dynamically created PDF blobs without violating strict site security policies.
- **Automated Trigger:** Automatically detects score completion and triggers certificate download.
- **Google Drive Sync:** Direct upload to Google Drive via OAuth2 & Google Drive API v3.

---

## 🛠️ How to Install in Chrome

1. **Download Code:** Click the green **`<Code>`** button above and select **Download ZIP**.
2. **Extract ZIP:** Unzip the downloaded file to a folder on your computer.
3. **Open Chrome Extensions:** Go to `chrome://extensions/` in your browser.
4. **Enable Developer Mode:** Turn on the **Developer mode** toggle in the top-right corner.
5. **Load Extension:** Click **Load unpacked** (top-left) and select the extracted folder.

---

## 📁 Optional: Set a Target Google Drive Folder

By default, certificates are saved directly to the root directory of your Google Drive. To save them into a specific folder:

1. Open your Google Drive folder and copy the Folder ID from the URL (e.g., `1a2b3c4d5e...` from `drive.google.com/drive/folders/1a2b3c4d5e...`).
2. Go to `chrome://extensions`, click **Inspect views: service worker** under this extension, open the **Console** tab, and run:
   ```javascript
   chrome.storage.sync.set({ driveFolderId: "YOUR_FOLDER_ID_HERE" });
