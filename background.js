chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "updateElementMenu",
    title: "append/remove this",
    contexts: ["link"],
    onclick: () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "appendOrRemoveElement"
        });
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "updateContextMenu": {
      let title = request.data.hasAppended
        ? "remove this element"
        : "append this element";

      chrome.contextMenus.update("updateElementMenu", {
        title: title
      });
      break;
    }
  }
});

var urlMap = [];
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status == "loading" && changeInfo.url != "undefined") {
    urlMap[tabId] = true;
  } else if (urlMap[tabId] && changeInfo.status == "complete") {
    urlMap[tabId] = false;
    chrome.tabs.sendMessage(tabId, {
      action: "onUrlUpdated",
      url: changeInfo.url
    });
  }
});
