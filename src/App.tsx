import React from 'react';
import './App.css';
function App() {
  return (
      <div id= "root" className="App">

          <title>Live Audio to Text Transcriptions Chrome Extension</title>

          <button id="record-button">Record</button>
          <button id="stop-record-button">Stop Record</button>

          <h1>Transcriptions</h1>

          <div id="transcription-text"></div>


      </div>
  );
}

export default App;
