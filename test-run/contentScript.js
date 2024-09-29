(() => {
  // Retrieve the full HTML content of the page
  const htmlContent = document.documentElement.outerHTML;
  const pageTitle = document.title;

  // Send the HTML content and page title to the background script
  chrome.runtime.sendMessage({ html: htmlContent, title: pageTitle });
})();
