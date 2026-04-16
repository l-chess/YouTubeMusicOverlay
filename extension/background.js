let overlayWindowId = null;

// open extension in tab
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({
    url: browser.runtime.getURL('ui/index.html')
  })
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TRACK_CHANGE') {
    browser.runtime.sendMessage(msg);
  }

  if (msg.type === 'GET_TRACK') {
    return browser.tabs.query({ url: 'https://music.youtube.com/*' }).then((tabs) => {
      if (tabs[0]) {
        return browser.tabs.sendMessage(tabs[0].id, { type: 'GET_TRACK' });
      }
    });
  }
});