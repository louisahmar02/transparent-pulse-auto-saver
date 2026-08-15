// ============================================================================
// Pulse Auto-Saver: Main World Interceptor (CSP Bypass)
// ============================================================================

(function() {
  // Intercept URL.createObjectURL (Captures dynamically generated Blobs/PDFs)
  const originalCreateObjectURL = URL.createObjectURL;
  URL.createObjectURL = function(blob) {
    const url = originalCreateObjectURL.apply(this, arguments);
    if (blob && blob.size > 0) {
      const reader = new FileReader();
      reader.onloadend = function() {
        window.postMessage({
          type: "PULSE_CAPTURED_BLOB",
          base64Data: reader.result,
          mimeType: blob.type || "application/pdf"
        }, "*");
      };
      reader.readAsDataURL(blob);
    }
    return url;
  };

  // Intercept Anchor Clicks (Captures direct download triggers)
  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    if (this.href) {
      window.postMessage({
        type: "PULSE_CAPTURED_LINK",
        url: this.href,
        fileName: this.download || "Pulse_Certificate.pdf"
      }, "*");
    }
    return originalClick.apply(this, arguments);
  };
})();
