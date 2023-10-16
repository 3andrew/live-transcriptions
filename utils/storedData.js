export async function getData(savedData, titles) {
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

export async function clearData(savedData, titles) {
    savedData = [];
    chrome.storage.local.set({transcriptions: []});
    chrome.storage.local.set({titles: []});
    document.getElementById("transcription-text").innerHTML = "";
}