// ============================================================================
// Pulse Auto-Saver: Background Service Worker (Google Drive Upload)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "upload_base64_file") {
    handleDirectUpload(request.base64Data, request.fileName);
  }
});

async function handleDirectUpload(base64Data, fileName) {
  try {
    console.log("🟢 [Background] Receiving file for Drive upload...");

    // Fetch user-configured Drive Folder ID from chrome.storage
    const storageData = await chrome.storage.sync.get(["driveFolderId"]);
    const rawFolderId = storageData.driveFolderId || "";
    const targetFolderId = cleanFolderId(rawFolderId);

    // Convert Base64 data to binary Blob
    const blob = dataUrlToBlob(base64Data);

    // Get OAuth token via Chrome Identity API
    const token = await getAuthToken();

    console.log("🟢 [Background] Uploading file directly to Google Drive...");
    const result = await uploadToDrive(token, blob, fileName, targetFolderId);
    console.log("🟢 [Background] SUCCESS! File saved to Drive:", result);
  } catch (err) {
    console.error("🔴 [Background] Drive Upload failed:", err?.message || err);
  }
}

function cleanFolderId(input) {
  if (!input) return "";
  const match = input.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match && match[1] ? match[1] : input.trim();
}

function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        chrome.identity.clearAllCachedAuthTokens(() => {
          const msg = chrome.runtime.lastError ? chrome.runtime.lastError.message : "Failed to get token";
          reject(new Error(msg));
        });
      } else {
        resolve(token);
      }
    });
  });
}

function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

async function uploadToDrive(token, blob, fileName, folderId) {
  const metadata = {
    name: fileName,
    mimeType: blob.type || "application/pdf",
    parents: folderId ? [folderId] : []
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", blob);

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}
