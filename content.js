// ============================================================================
// Pulse Auto-Saver: Content Script (Isolated World Controller)
// ============================================================================

const TARGET_SELECTOR = ".score, mln-result-chart";
let hasProcessed = false;

// Listen for intercepted file data from Main World
window.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "PULSE_CAPTURED_BLOB") {
    console.log("🟢 [Pulse Auto-Saver] Captured Blob file from page!");
    chrome.runtime.sendMessage({
      action: "upload_base64_file",
      base64Data: event.data.base64Data,
      fileName: `Pulse_Certificate_${Date.now()}.pdf`
    });
  } else if (event.data.type === "PULSE_CAPTURED_LINK") {
    console.log("🟢 [Pulse Auto-Saver] Captured file link from page:", event.data.url);
    if (event.data.url.startsWith("data:")) {
      chrome.runtime.sendMessage({
        action: "upload_base64_file",
        base64Data: event.data.url,
        fileName: event.data.fileName || `Pulse_Certificate_${Date.now()}.pdf`
      });
    }
  }
});

function watchForTestCompletion() {
  if (document.querySelector(TARGET_SELECTOR)) {
    console.log("🟢 [Pulse Auto-Saver] Target element found immediately!");
    triggerDownloadAndUpload();
    return;
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector(TARGET_SELECTOR) && !hasProcessed) {
      console.log("🟢 [Pulse Auto-Saver] Target element detected!");
      observer.disconnect();
      triggerDownloadAndUpload();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function findDownloadButton() {
  const elements = Array.from(document.querySelectorAll("button, a, .btn"));
  return elements.find((el) => el.textContent.trim().toLowerCase().includes("download"));
}

function triggerDownloadAndUpload() {
  if (hasProcessed) return;

  const downloadBtn = findDownloadButton();
  if (!downloadBtn) {
    console.warn("⚠️ [Pulse Auto-Saver] Download button not rendered yet. Retrying in 1s...");
    setTimeout(triggerDownloadAndUpload, 1000);
    return;
  }

  hasProcessed = true;
  console.log("🟢 [Pulse Auto-Saver] Triggering Download button click...");
  downloadBtn.click();
}

watchForTestCompletion();
