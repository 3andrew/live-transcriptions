/*global chrome*/
import React from 'react';
import './App.css';
import API_TOKEN from "./env.js";

var savedData : any = [];

function record() {

    // get the audio stream
    chrome.tabCapture.capture(
        {
            audio: true,
        },
        (stream:any) => {
            console.log("stream:", stream);

            // continue projecting audio to user
            const output = new AudioContext();
            const source = output.createMediaStreamSource(stream);
            source.connect(output.destination);

            // create mediarecorder to get blob from mediastream
            const mediaRecorder = new MediaRecorder(stream, {mimeType: "audio/webm"});

            mediaRecorder.start();

            document.getElementById( "stop-record-button")?.addEventListener("click", () => {
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

                savedData.push(text);

                // @ts-ignore
                document.getElementById("transcription-text")?.innerHTML += text + "<br><br>";

                console.log("saved data:", savedData);
                chrome.storage.local.set({ transcriptions: savedData });
            }
        }
    );
}

const getTranscription = async (data : FormData) => {
    try {
        // https://platform.openai.com/docs/api-reference/audio/createTranscription
        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": API_TOKEN
            },
            body: data
        });
        const transcription = await response.json();
        return transcription.text;

    } catch (error) {
        console.error("error:", error);
    }

}

function App() {
  return (
      <div id= "root" className="App">

          <title>Live Audio to Text Transcriptions Chrome Extension</title>

          <button onClick={record}>Record</button>
          <button id="stop-record-button">Stop Record</button>

          <h1>Transcriptions</h1>

          <div id="transcription-text"></div>


      </div>
  );
}

export default App;
