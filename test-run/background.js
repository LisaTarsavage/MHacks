// background.js

// Listen for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const url = tab.url;
    if (url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://')) {
      // Inject the content script into the current tab
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['contentScript.js']
      });
    }
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.html) {
    const htmlContent = message.html;
    const pageTitle = message.title;

    // Create a Blob from the HTML content
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });

    // Generate a valid filename
    let filename = 'page.html';
    if (pageTitle) {
      filename = pageTitle.replace(/[\\/:*?"<>|]/g, '_') + '.html';
    }

    // Create FormData and append the file
    const formData = new FormData();
    formData.append('file', htmlBlob, filename);
    formData.append('title', pageTitle);
    formData.append('url', sender.tab.url);

    // Send the FormData to the backend
    fetch('https://b3a9-35-0-30-233.ngrok-free.app/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP ${response.status} - ${response.statusText}\n${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        // Handle the received data
      })
      .catch((error) => {
        console.error('Error:', error);
        // Optionally, handle errors, e.g., display a notification
      });
  }
});
