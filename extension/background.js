// background.js
let overlayWindowId = null;

// Open overlay
browser.browserAction.onClicked.addListener(() => {
  browser.windows.create({
    url: browser.runtime.getURL('ui/index.html'),
    type: 'popup',
    state: 'fullscreen'
  }).then((win) => {
    overlayWindowId = win.id;
  });
});

// Listen for messages from content.js
browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TRACK_CHANGE') {
    // Forward to all runtime listeners (your overlay)
    browser.runtime.sendMessage(msg);
  }
});
