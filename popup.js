let currentHostElements = document.getElementById("currentHostElements");
let emptyPageText = document.getElementById("emptyPageText");

window.onload = function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let data = {
      action: "onPopupOpened"
    };
    chrome.tabs.sendMessage(tabs[0].id, data);
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("popup request", request);
  if (request.action == "updatePopup") {
    onPopupDataReceived(request.data);
  }
});

function onPopupDataReceived(data) {
  if (data && data.length > 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      currentHostElements.innerHTML = "";
      emptyPageText.remove();

      data.forEach((item, index) => {
        let lineWrapper = document.createElement("div");
        lineWrapper.classList.add("lineWrapper");

        let colorIndicator = document.createElement("div");
        colorIndicator.classList.add("colorIndicator");
        colorIndicator.id = "colorIndicator" + index;

        let spanNode = document.createElement("span");
        spanNode.classList.add("elementNumber");
        let titleNode = document.createTextNode("" + item.count);
        spanNode.appendChild(titleNode);
        colorIndicator.appendChild(spanNode);

        let btnHighlight = document.createElement("button");
        btnHighlight.classList.add("popupButton");
        titleNode = document.createTextNode("highlight");
        btnHighlight.appendChild(titleNode);
        btnHighlight.onclick = () => {
          chrome.tabs.query({ active: true, currentWindow: true }, function(
            tabs
          ) {
            let data = {
              action: "highlightElement",
              data: { path: item.path, index }
            };
            chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
          });
        };

        let btnRemove = document.createElement("button");
        btnRemove.classList.add("popupButton");
        titleNode = document.createTextNode("remove");
        btnRemove.appendChild(titleNode);
        btnRemove.onclick = () => {
          chrome.tabs.query({ active: true, currentWindow: true }, function(
            tabs
          ) {
            let data = {
              action: "removeElement",
              data: item.path
            };
            chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
          });
        };

        lineWrapper.appendChild(colorIndicator);
        lineWrapper.appendChild(btnHighlight);
        lineWrapper.appendChild(btnRemove);
        currentHostElements.appendChild(lineWrapper);
      });
    });
  }
}
