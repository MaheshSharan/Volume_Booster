document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        document.getElementById('tabTitle').textContent = tabs[0].title;

        // Retrieve the saved volume for the tab (if any)
        chrome.storage.local.get([`volume_${tabId}`], function (result) {
            const savedVolume = result[`volume_${tabId}`] || 100; // Default to 100 if not found
            document.getElementById('volumeSlider').value = savedVolume;
            document.getElementById('volumeLabel').textContent = savedVolume + '%';
        });

        // Event listener for slider input
        document.getElementById('volumeSlider').addEventListener('input', function () {
            const volume = this.value;
            document.getElementById('volumeLabel').textContent = volume + '%';

            // Save the volume in chrome storage
            chrome.storage.local.set({ [`volume_${tabId}`]: volume });

            // Apply the volume to the tab
            chrome.scripting.executeScript({
                target: { tabId: tabId },
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
