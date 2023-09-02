function record() {

    // get the audio stream
    chrome.tabCapture.capture(
        {
            audio: true,
        },
        (stream) => {
            console.log("stream:", stream);

            // continue projecting audio to user
            const output = new AudioContext();
            const source = output.createMediaStreamSource(stream);
            source.connect(output.destination);

            // create mediarecorder to get blob from mediastream
            const mediaRecorder = new MediaRecorder(stream, {mimeType: "audio/webm"});

            mediaRecorder.start();

            // stop mediarecorder when button pressed
            document.getElementById( "stop-record-button").addEventListener("click", () => {
                mediaRecorder.stop();
                stream.getAudioTracks()[0].stop(); // deactivate mediastream
            } );

            // convert to file when recording ends
            mediaRecorder.ondataavailable = async (event) => {
                console.log("data:", event.data);

                const blob = new Blob([event.data], {type: "audio/webm"});
                const file = new File([blob], "file.webm", {type: "audio/webm"});
                console.log("file:", file);

                // convert to body of request
                const formData = new FormData();

                formData.append("model", "whisper-1");
                formData.append("file", file);
                console.log("request body:", formData);

                const text = await getTranscription(formData);
                console.log("transcription:", text);

                document.getElementById("transcription-text").innerHTML += text + "<br><br>";
            }
        }
    );
}

document.getElementById( "record-button" ).addEventListener("click", () => {
    record();
} );

const getTranscription = async (data) => {
    try {
        // https://platform.openai.com/docs/api-reference/audio/createTranscription
        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": apiToken
            },
            body: data
        });
        const transcription = await response.json();
        return transcription.text;

    } catch (error) {
        console.error("error:", error);
    }

}