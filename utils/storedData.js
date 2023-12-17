export async function getData(savedData, titles) {
    // get saved transcriptions and titles from chrome storage
    const savedTranscripts = await chrome.storage.local.get(["transcriptions"]);
    const savedTitles = await chrome.storage.local.get(["titles"]);

    console.log("savedTranscripts:", savedTranscripts)
    savedData = savedTranscripts.transcriptions;
    if (!savedData) {
        savedData = [];
    }

    titles = savedTitles.titles;
    if (!titles) {
        titles = [];
    }

    for (var i = 0; i < savedData.length; i++) (function(i){
        let transcription = document.createElement("div");
        transcription.id = "div-" + i.toString();
        transcription.innerHTML = "<b>" + titles[i] + "</b><br>" + savedData[i] + "<br><br>";

        let copyButton = document.createElement("button");
        copyButton.type = "button"
        copyButton.innerHTML = "Copy";
        copyButton.addEventListener("click", function(){
            console.log("Copied text")
            navigator.clipboard.writeText(savedData[i]);
        })

        transcription.appendChild(copyButton);

        document.getElementById("transcription-text").appendChild(transcription);
    })(i)

    return [savedData, titles]
}

export async function clearData(savedData, titles) {
    savedData = [];
    chrome.storage.local.set({transcriptions: []});
    chrome.storage.local.set({titles: []});
    document.getElementById("transcription-text").innerHTML = "";
}