// ============================================================================
// Pulse Auto-Saver: Background Service Worker (GitHub Upload)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "upload_base64_file") {
    handleGitHubUpload(request.base64Data, request.fileName);
  }
});

async function handleGitHubUpload(base64Data, fileName) {
  try {
    console.log("🟢 [Background] Receiving file for GitHub upload...");

    // Fetch user settings stored in chrome.storage
    const config = await chrome.storage.sync.get([
      "githubToken",
      "githubRepo",  // e.g., "username/repository"
      "githubPath"   // e.g., "certificates" or leave empty for root
    ]);

    const token = config.githubToken;
    const repo = config.githubRepo; // Expected format: "username/repo"
    const folderPath = config.githubPath ? config.githubPath.replace(/^\/|\/$/g, "") : "";

    if (!token || !repo) {
      console.error("🔴 [Background] GitHub credentials missing! Please configure Popup/Options.");
      return;
    }

    // Clean Base64 string (GitHub API requires raw base64 without the 'data:...;base64,' prefix)
    const rawBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

    // Construct target file path inside the repository
    const targetPath = folderPath ? `${folderPath}/${fileName}` : fileName;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${targetPath}`;

    console.log(`🟢 [Background] Uploading to GitHub repo (${repo}) at path: ${targetPath}`);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        message: `Auto-saved certificate: ${fileName}`,
        content: rawBase64
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error (${response.status}): ${errorData.message}`);
    }

    const result = await response.json();
    console.log("🟢 [Background] SUCCESS! File committed to GitHub:", result.content.html_url);
  } catch (err) {
    console.error("🔴 [Background] GitHub upload failed:", err?.message || err);
  }
}
