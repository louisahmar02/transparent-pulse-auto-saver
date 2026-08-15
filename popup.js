document.addEventListener("DOMContentLoaded", () => {
  const folderInput = document.getElementById("folderId");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  // Load existing saved folder ID from extension storage
  chrome.storage.sync.get(["driveFolderId"], (result) => {
    if (result.driveFolderId) {
      folderInput.value = result.driveFolderId;
    }
  });

  // Save new folder ID to extension storage
  saveBtn.addEventListener("click", () => {
    const folderId = folderInput.value.trim();
    chrome.storage.sync.set({ driveFolderId: folderId }, () => {
      status.style.display = "block";
      setTimeout(() => {
        status.style.display = "none";
      }, 2000);
    });
  });
});