// ==================== CONFIGURATION ====================
const TARGET_SELECTOR = ".score, mln-result-chart";
// =======================================================

console.log("🟢 [Pulse Auto-Saver] Active and monitoring page...");

let hasCaptured = false;

function watchForTestCompletion() {
  if (document.querySelector(TARGET_SELECTOR)) {
    console.log("🟢 [Pulse Auto-Saver] Target element found immediately!");
    triggerCapture();
    return;
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector(TARGET_SELECTOR) && !hasCaptured) {
      console.log("🟢 [Pulse Auto-Saver] Target element detected!");
      observer.disconnect();
      triggerCapture();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function triggerCapture() {
  if (hasCaptured) return;
  hasCaptured = true;

  // Retrieve user's configured Google Drive Folder ID from extension storage
  chrome.storage.sync.get(["driveFolderId"], (data) => {
    const userFolderId = data.driveFolderId || "";

    console.log("🟢 [Pulse Auto-Saver] Requesting screenshot capture...");
    chrome.runtime.sendMessage({
      action: "capture_and_upload",
      folderId: userFolderId
    });
  });
}

watchForTestCompletion();