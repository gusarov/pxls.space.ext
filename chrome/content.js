console.log("!!! content js")

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	console.log("!!! content js request")
    if (request.action == "getHtml") {
        sendResponse({doc: document});
    } else {
        sendResponse({});
    }
});

