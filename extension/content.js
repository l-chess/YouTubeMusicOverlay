let lastTrack = { title: null, artist: null, cover: null };

function upgradeCoverUrl(url, size = 544) {
  if (!url || !url.includes('lh3.googleusercontent.com')) return url;

  // Split on '=' to isolate the w/h segment at the end
  const parts = url.split('=');
  const lastPart = parts[parts.length - 1];

  // Replace only the wXX-hXX part safely
  const upgraded = lastPart.replace(/w\d+-h\d+/, 'w' + size + '-h' + size);

  parts[parts.length - 1] = upgraded;
  return parts.join('=');
}

function getNowPlaying() {
  const title = document.querySelector('ytmusic-player-bar .title')?.textContent || '';
  const byline = document.querySelector('ytmusic-player-bar .byline')?.textContent || '';
  let cover = document.querySelector('ytmusic-player-bar img')?.src || '';

  cover = upgradeCoverUrl(cover, 544); // safe upgrade

  const artist = byline.split('•')[0].trim();
  return { title, artist, cover };
}

const observer = new MutationObserver(() => {
  const data = getNowPlaying();

  if (
    data.title &&
    (data.title !== lastTrack.title ||
      data.artist !== lastTrack.artist ||
      data.cover !== lastTrack.cover)
  ) {
    lastTrack = data;
    browser.runtime.sendMessage({ type: 'TRACK_CHANGE', data });
  }
});

observer.observe(document.body, { childList: true, subtree: true });
