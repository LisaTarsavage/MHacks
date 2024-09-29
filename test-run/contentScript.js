(() => {
  // Retrieve the full HTML content of the page
  const htmlContent = document.documentElement.outerHTML;
  const pageTitle = document.title;

  // Send the HTML content and page title to the background script
  chrome.runtime.sendMessage({ html: htmlContent, title: pageTitle });
})();

console.log('Content script is running');

const htmlContent = document.documentElement.outerHTML;
const pageTitle = document.title;

// Send the content to the background script
chrome.runtime.sendMessage({
  html: htmlContent,
  title: pageTitle
}, () => {
  if (chrome.runtime.lastError) {
    console.error('Message sending failed:', chrome.runtime.lastError);
  } else {
    console.log('Message sent successfully from content script');
  }
});
