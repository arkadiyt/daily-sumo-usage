(function() {
  "use strict";

  var sendApiSession = function(api_session) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, api_session);
    });
  };

  var filter = {
    urls: ["https://service.sumologic.com/json/v1/authentication/user"]
  };
  var opt_extraInfoSpec = ["requestHeaders"];
  var headerCallback = function(details) {
    var headers = details.requestHeaders;
    var api_session = null;
    for (var i = 0; i < headers.length; ++i) {
      if (headers[i].name === 'ApiSession') {
        api_session = headers[i].value;
        break;
      }
    }

    if (api_session) {
      sendApiSession(api_session);
    }
  };

  chrome.webRequest.onBeforeSendHeaders.addListener(headerCallback, filter, opt_extraInfoSpec);
})();