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
  if (message.html) {
    const htmlContent = message.html;
    const pageTitle = message.title;

    // Send the HTML content to the API
    fetch('https://your-api.com/upload', {
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
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP ${response.status} - ${response.statusText}\n${text}`);
        });
      }
      // Here we expect the response to be an audio file
      return response.blob(); // Read the response as a Blob (binary data)
    })
    .then(blob => {
      // Handle the audio file blob
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(blob);

      // Option 1: Download the audio file
      /*
      // Generate a valid filename
      let filename = 'audio.mp3'; // Adjust the extension based on the audio format
      if (pageTitle) {
        filename = pageTitle.replace(/[\\/:*?"<>|]/g, '_') + '.mp3';
      }

      // Initiate the download
      chrome.downloads.download({
        url: audioUrl,
        filename: filename
      });
      */

      // Option 2: Play the audio file
      // Inject code into the tab to play the audio
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: (audioUrl) => {
          let audio = new Audio();
          audio.src = audioUrl;
          audio.style.display = 'none'; // Hide the audio element
          document.body.appendChild(audio);
          audio.play();
        },
        args: [audioUrl]
      });

      // Optionally revoke the object URL after some time
      setTimeout(() => {
        URL.revokeObjectURL(audioUrl);
      }, 60000); // Revoke after 1 minute
    })
    .catch((error) => {
      console.error('Error:', error);
      // Optionally, handle errors, e.g., display a notification
    });
  }
});