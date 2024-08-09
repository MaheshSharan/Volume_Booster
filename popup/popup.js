document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      document.getElementById('tabTitle').textContent = tabs[0].title;
      
      document.getElementById('volumeSlider').addEventListener('input', function() {
          const volume = this.value;
          document.getElementById('volumeLabel').textContent = volume + '%';
          chrome.scripting.executeScript({
              target: {tabId: tabs[0].id},
              function: setVolume,
              args: [volume]
          });
      });
  });
});

function setVolume(volume) {
  let audioCtx = window.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  let gainNode = window.gainNode || audioCtx.createGain();
  
  window.audioCtx = audioCtx;
  window.gainNode = gainNode;

  gainNode.gain.value = volume / 100;

  const mediaElements = document.querySelectorAll('audio, video');
  mediaElements.forEach(mediaElement => {
      if (!mediaElement.source) {
          const source = audioCtx.createMediaElementSource(mediaElement);
          source.connect(gainNode).connect(audioCtx.destination);
          mediaElement.source = source;
      }
  });
}
