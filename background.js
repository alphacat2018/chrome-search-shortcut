chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "tabsCreate") {
    chrome.tabs.create(
      { url: request.options.url, active: request.options.active },
      () => {}
    );
  } else if (request["elementInfo"]) {
    chrome.contextMenus.update("updateElementMenu", {
      title:
        (request["elementInfo"]["hasAppended"] && "删除该元素") || "添加新元素"
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  // When the app gets installed, set up the context menus
  let onElementClick = function(element) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "appendOrRemoveElement"
      });
    });

    // alert (JSON.stringify (word));
    // var query = word.selectionText;
  };

  chrome.contextMenus.create({
    id: "updateElementMenu",
    title: "添加/删除该元素",
    contexts: ["link"], // ContextType
    onclick: onElementClick // A callback function
  });
});

var urlMap = [];
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status == "loading" && changeInfo.url != "undefined") {
    urlMap[tabId] = true;
    // the tab just changed url
  } else if (urlMap[tabId] && changeInfo.status == "complete") {
    urlMap[tabId] = false;
    chrome.tabs.sendMessage(tabId, {
      action: "onUrlUpdated",
      url: changeInfo.url
    });
  }
  //   if (changeInfo.url) {
  //     chrome.tabs.sendMessage(tabId, {
  //       action: "onUrlUpdated",
  //       url: changeInfo.url
  //     });
  //   }
});
