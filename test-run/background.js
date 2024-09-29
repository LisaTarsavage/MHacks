// background.js

// Listen for the browser action (extension icon) click
chrome.action.onClicked.addListener((tab) => {
  const url = tab.url;
  if (url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  if (message.html) {
    const htmlContent = message.html;
    const pageTitle = message.title;

    console.log('Preparing to send fetch request');

    // Send the HTML content to the API
    fetch('https://b3a9-35-0-30-233.ngrok-free.app/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Include Authorization header if needed
      },
      body: JSON.stringify({
        title: pageTitle,
        html: htmlContent,
        url: sender.tab.url
      })
    })
    .then(response => {
      console.log('Fetch response received:', response);

      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP ${response.status} - ${response.statusText}\n${text}`);
        });
      }
      // Handle the response as needed
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
