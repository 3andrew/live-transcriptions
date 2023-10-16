var savedData = [];
var titles = [];

getData();

document.getElementById("delete-all-button").addEventListener("click", () => {
    clearData();
});

document.getElementById("record-button").addEventListener("click", () => {
    record();
});

document.getElementById("stop-record-button").style.display = "none";

async function getData() {
    // get saved transcriptions and titles from chrome storage
    const savedTranscripts = await chrome.storage.local.get(["transcriptions"]);
    const savedTitles = await chrome.storage.local.get(["titles"]);

    console.log(savedTranscripts)
    savedData = savedTranscripts.transcriptions;
    if (!savedData) {
        savedData = [];
    }

    titles = savedTitles.titles;
    if (!titles) {
        titles = [];
    }

    for (var i = 0; i < savedData.length; i++) {
        document.getElementById("transcription-text").innerHTML += "<b>" + titles[i] + "</b><br>" + savedData[i] + "<br><br>";
    }
}

async function clearData() {
    savedData = [];
    chrome.storage.local.set({transcriptions: []});
    chrome.storage.local.set({titles: []});
    document.getElementById("transcription-text").innerHTML = "";
}

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

            document.getElementById("record-button").style.display = "none";
            document.getElementById("stop-record-button").style.display = "block";

            // stop mediarecorder when button pressed
            document.getElementById("stop-record-button").addEventListener("click", () => {
                mediaRecorder.stop();
                stream.getAudioTracks()[0].stop(); // deactivate mediastream
                document.getElementById("record-button").style.display = "block";
                document.getElementById("stop-record-button").style.display = "none";
            });

            // convert to file when recording ends
            mediaRecorder.ondataavailable = async (event) => {
                console.log("data:", event.data);

                const blob = new Blob([event.data], {type: "audio/webm"});
                const file = new File([blob], "file.webm", {type: "audio/webm"});

                console.log("file:", file);

                // convert to body of request to API
                const formData = new FormData();

                formData.append("model", "whisper-1");
                formData.append("file", file);
                console.log("request body:", formData);

                const text = await getTranscription(formData);
                console.log("transcription:", text);

                // save the response from the API
                savedData.push(text);

                // save current date as the default title
                currentTime = new Date().toLocaleString();
                titles.push(currentTime);

                document.getElementById("transcription-text").innerHTML += "<b>" + currentTime + "</b><br>" + text + "<br><br>";

                console.log("saved data:", savedData);
                chrome.storage.local.set({transcriptions: savedData});
                chrome.storage.local.set({titles: titles});
            }
        }
    );
}

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