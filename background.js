// ============================================================================
// Pulse Auto-Saver: Background Service Worker (Full-Page Capture & Upload)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture_and_upload") {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      handleCaptureAndUpload(request.folderId, tabId);
    } else {
      console.error("🔴 [Background] Could not identify target tab ID.");
    }
  }
});

async function handleCaptureAndUpload(folderId, tabId) {
  try {
    console.log("🟢 [Background] Fetching Google Auth Token...");
    const token = await getAuthToken();

    console.log("🟢 [Background] Capturing Full-Page Screenshot...");
    const dataUrl = await captureFullPageScreenshot(tabId);

    console.log("🟢 [Background] Converting Image Data...");
    const blob = dataUrlToBlob(dataUrl);
    const fileName = `Pulse_Test_${new Date().toISOString().replace(/:/g, '-')}.png`;

    console.log("🟢 [Background] Uploading to Google Drive...");
    const result = await uploadToDrive(token, blob, fileName, folderId);
    
    console.log("🟢 [Background] SUCCESS! Full-page screenshot uploaded to Drive:", result);
  } catch (err) {
    const errorDetails = err?.message || JSON.stringify(err);
    console.error("🔴 [Background] Upload Process Failed:", errorDetails);
  }
}

/**
 * Captures full scrollable vertical height using Chrome DevTools Protocol
 */
function captureFullPageScreenshot(tabId) {
  return new Promise((resolve, reject) => {
    const target = { tabId: tabId };

    chrome.debugger.attach(target, "1.3", () => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }

      chrome.debugger.sendCommand(
        target,
        "Page.captureScreenshot",
        { format: "png", captureBeyondViewport: true },
        (result) => {
          const err = chrome.runtime.lastError;
          chrome.debugger.detach(target, () => {
            if (err) {
              return reject(new Error(err.message));
            }
            if (result && result.data) {
              resolve("data:image/png;base64," + result.data);
            } else {
              reject(new Error("Failed to capture full-page screenshot data."));
            }
          });
        }
      );
    });
  });
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
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
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
    mimeType: 'image/png',
    parents: folderId ? [folderId] : []
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', blob);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}