// Can use
// chrome.devtools.*
// chrome.extension.*

// Create a tab in the devtools area
var panel = chrome.devtools.panels.create("Scraper", "toast.png", "panel.html", function(panel) {});
