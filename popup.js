function record() {
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        (tabs) => {
            const tabId = tabs[0].id;
            // get the stream
            chrome.tabCapture.capture(
                {
                    audio: true,
                    video: false
                },
                (stream) => {
                    console.log("stream:", stream);

                    // continue projecting audio to user
                    const output = new AudioContext();
                    const source = output.createMediaStreamSource(stream);
                    source.connect(output.destination);

                    // create mediarecorder to get blob from mediastream
                    let recordedData = [];
                    const mediaRecorder = new MediaRecorder(stream, {mimeType: "audio/webm"});

                    mediaRecorder.start();

                    // stop mediarecorder when button pressed
                    document.getElementById( 'stop-record-button' ).addEventListener('click', () => {
                        mediaRecorder.stop();
                    } );

                    // convert to file when recording ends
                    mediaRecorder.onstop = (event) => {
                        recordedData.push(event.data)
                        console.log("data:", recordedData);

                        const blob = new Blob(recordedData , {type: "audio/webm"});
                        const file = new File( [ blob ], "file.webm", {type: "audio/webm"} );
                        console.log("file:", file);
                    }



                }
            );
        }
    );
}
document.getElementById( 'record-button' ).addEventListener('click', () => {
    record();
} );

