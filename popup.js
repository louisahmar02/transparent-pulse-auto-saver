// ============================================================================
// Pulse Auto-Saver: Popup Settings Controller
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const folderInput = document.getElementById("folderId");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  // Load existing saved folder ID from storage
  chrome.storage.sync.get(["driveFolderId"], (result) => {
    if (result.driveFolderId) {
      folderInput.value = result.driveFolderId;
    }
  });

  // Save new folder ID to storage (Extracts ID if a full URL was pasted)
  saveBtn.addEventListener("click", () => {
    const rawInput = folderInput.value.trim();
    const cleanedFolderId = extractFolderId(rawInput);

    // Update input box to display the cleaned ID
    folderInput.value = cleanedFolderId;

    chrome.storage.sync.set({ driveFolderId: cleanedFolderId }, () => {
      status.style.display = "block";
      setTimeout(() => {
        status.style.display = "none";
      }, 2000);
    });
  });
});

/**
 * Extracts raw Folder ID from full Google Drive URL if pasted
 */
function extractFolderId(urlOrId) {
  if (!urlOrId) return "";
  const match = urlOrId.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : urlOrId;
}
