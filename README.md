# Transparent Pulse Auto-Saver 📸

An automated Chrome Extension (Manifest V3) that captures full-page vertical screenshots of Transparent Pulse test results and automatically uploads them to Google Drive.

## Features
- **Automatic Detection:** Automatically triggers when test results (`.score`, `mln-result-chart`) render on the screen.
- **Full-Page Screenshot:** Captures the full vertical height of the score card using Chrome DevTools Protocol.
- **Custom Destination:** Users can save screenshots to any Google Drive folder ID using the popup UI.

## Installation Instructions

1. Clone or download this repository as a ZIP.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the project folder.
5. In `chrome://extensions`, click **Details** on the extension card and set **Site access** to **On all sites**.


## 🔧 Technologies Used
- Chrome Extension Manifest V3
- Google Drive API v3
- Chrome Debugger Protocol
- JavaScript (ES6)

## 🚀 Future Improvements
- [ ] Support for multiple test result formats
- [ ] Option to auto-create Google Drive folder
- [ ] Notification system for upload status

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first.

## 📝 License
[MIT](https://choosealicense.com/licenses/mit/)

## ⚠️ Disclaimer
This extension is not affiliated with or endorsed by Transparent.com. Use at your own discretion.
