// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

Split(['.pl', '.pr'], {
    sizes: [74.5, 25],
});

const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true,
    mode: "text/x-groovy"
});
editor.setSize("100%", "100%");

const message = document.querySelector('#message');
document.querySelector('#load').addEventListener('click', function () {

    const request = new Request('https://scraper-stub-api.herokuapp.com/scrapers/amazon/purchase_history');

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.text();
            } else {
                message.innerHTML = "Script load failed " + response.status;
            }
        }).then(function (text) {
            editor.setValue(text);
            message.innerHTML = "Script load succeeded";
        }).catch(error => {
            message.innerHTML = "Script load exception " + error;
        });
}, false);

document.querySelector('#save').addEventListener('click', function () {

    const request = new Request(
        'https://scraper-stub-api.herokuapp.com/scrapers/amazon/purchase_history',
        { method: 'POST', body: editor.getValue() });

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                message.innerHTML = "Script save succeeded";
            } else {
                message.innerHTML = "Script save failed " + response.status;
            }
        }).catch(error => {
            message.innerHTML = "Script save exception " + error;
        });
}, false);

document.querySelector('#test').addEventListener('click', function () {

    const request = new Request(
        'https://scraper-stub-api.herokuapp.com/scrapers/amazon/purchase_history/test',
        { method: 'PUT', body: editor.getValue() });

    fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.text();
            } else {
                message.innerHTML = "Script test failed " + response.status;
            }
        }).then(function (text) {
            message.innerHTML = "Script test succeeded: <br>" + text;
        }).catch(error => {
            message.innerHTML = "Script test exception " + error;
        });
}, false);
