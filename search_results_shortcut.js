const HIGHLIGHTED_ELEMENT_ATTR = "highlighted-search-result";
const TINTED_ELEMENT_CLASS = "tinted-search-result";
const ELEMENT_PATH_ACCURACY_LEVEL = 2;

const search_result_shortcut = {
  options: {
    nextKey: "down, j",
    previousKey: "up, k",
    navigateKey: "return, space",
    navigateNewTabBackgroundKey: "ctrl+return, command+return, ctrl+space",
    navigateNewTabKey:
      "ctrl+shift+return, command+shift+return, ctrl+shift+space"
  },

  init() {
    this.shortcutElements = storage.getElementsOfthisHost(
      window.location.hostname
    );

    console.log(
      "host",
      window.location.hostname,
      "shortcutElements",
      this.shortcutElements
    );
    this._initSearcher();
    this._bindHotKeys();
    this._registerEventListener();
  },

  _refresh() {
    if (this._isCurrentHostShortcutAvailable()) {
      if (!this.searcher) {
        this._initSearcher();
        this._bindHotKeys();
      }

      this.searcher.refresh();
    } else {
      if (this.searcher) {
        this.searcher = null;
        this._unbindHotKeys();
      }
    }
  },

  _isCurrentHostShortcutAvailable() {
    return this.shortcutElements && !!this.shortcutElements.length;
  },

  _initSearcher() {
    if (!this._isCurrentHostShortcutAvailable()) return;
    this.searcher = new Searcher(this.shortcutElements);
  },

  _hasElementShortcut(elementPath = "") {
    return !!this.shortcutElements.find(path => elementPath == path);
  },

  _findNearestHrefNodePathUpwards(element) {
    console.log("findNearestANodePathUpwards", element);
    if (!element) return;

    if (element.nodeName == "A") {
      let remainLevel = ELEMENT_PATH_ACCURACY_LEVEL;
      let pathToNode = "";

      while (element && element.nodeName != "BODY" && remainLevel > 0) {
        let idStr = ":not([id])";
        let classStr = ":not([class])";
        if (/\d+/g.test(element.id)) {
          idStr = "";
        } else if (element.id) {
          idStr = `#${element.id}`;
        }

        if (element.className) {
          let classArr = [];
          element.classList.forEach(item => {
            classArr.push(item);
          });

          let validClassStr = classArr.map(i => `.${i}`).join("");
          if (validClassStr) {
            classStr = validClassStr;
            remainLevel--;
          }
        }

        pathToNode = `${
          element.nodeName
        }${classStr}${idStr} ${pathToNode}`.trim();
        element = element.parentNode;
      }

      return pathToNode;
    } else {
      return (
        element &&
        element.parentNode &&
        this._findNearestHrefNodePathUpwards(element.parentNode)
      );
    }
  },

  _registerEventListener() {
    document.onmousedown = element => {
      // right click
      if (element.button != 2) return;

      let path = this._findNearestHrefNodePathUpwards(element.srcElement);
      if (!path) {
        console.warn("Can not find the nearest href node of element:", element);
        return;
      }

      let info = {
        element: element.srcElement,
        path: path,
        hasAppended: this._hasElementShortcut(path)
      };

      chrome.runtime.sendMessage({
        action: "updateContextMenu",
        data: info
      });

      console.log("onmousedown", element, info);
      this.lastClickedElement = info;
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("request", request, this.lastClickedElement);

      switch (request.action) {
        // case "removeAllElementsOfCurrentHost":
        //   this._removeAllElementsOfHost();
        //   break;
        // case "removeAllHosts":
        //   storage.clear();
        //   break;
        case "removeElement":
          this._removeElementPath(request.data);
          this._refreshPopup();
          break;
        case "highlightElement":
          this._highlightElementsWithPath(request.data);
          break;
        case "appendOrRemoveElement":
          if (this.lastClickedElement.hasAppended) {
            this._removeElementPath(this.lastClickedElement.path);
          } else {
            this._appendElementPath(this.lastClickedElement.path);
          }
        case "onUrlUpdated":
          this.searcher && this.searcher.reset();
          break;
        case "onPopupOpened":
          this._refreshPopup();
          break;
      }
    });
  },

  _refreshPopup() {
    let data = this.searcher.getEachNodeCount();
    chrome.runtime.sendMessage({
      action: "updatePopup",
      data: data
    });
  },

  _appendElementPath(path) {
    console.log("append element", path);

    if (this._hasElementShortcut(path)) return;

    this.shortcutElements.push(path);
    storage.appendElementToHost(window.location.hostname, path);
    this._refresh();
  },

  _removeElementPath(path) {
    let index = this.shortcutElements.findIndex(item => item == path);
    console.log("delete element", path, index);
    if (index < 0) {
      console.log("failed to delete element", path);
      return;
    }

    this.shortcutElements.splice(index, 1);
    storage.removeElementFromHost(window.location.hostname, path);
    this._refresh();
  },

  _highlightElementsWithPath(data) {
    console.log("_highlightElementsWithPath", data.path);

    let index = this.shortcutElements.findIndex(item => item == data.path);
    if (index < 0) return;

    this.searcher.toggleTintColor(data.path, data.index);
  },

  _removeAllElementsOfHost() {
    this.shortcutElements = [];
    storage.removeAllElementsOfHost(window.location.hostname);
  },

  _bindHotKeys() {
    if (!this._isCurrentHostShortcutAvailable()) return;

    this._bindKey(this.options.nextKey, () => {
      if (this.searcher) {
        this.searcher.refresh();
        this.searcher.focusNext();
      }
    });
    this._bindKey(this.options.previousKey, () => {
      if (this.searcher) {
        this.searcher.refresh();
        this.searcher.focusPrevious();
      }
    });
  },

  _unbindHotKeys() {
    key.unbind(this.options.nextKey);
    key.unbind(this.options.previousKey);
  },

  _bindKey(shortcut, callback) {
    key(shortcut, function(event) {
      callback();
      if (event !== null) {
        event.stopPropagation();
        event.preventDefault();
      }
      return false;
    });
  }
};

function Searcher(targetPath) {
  this.targetPath = targetPath;
  this.nodes = [];
  this.focusedIndex = -1;

  this.refresh = () => {
    this.nodes = document.querySelectorAll(targetPath);
    console.log("this.nodes", this.nodes);
  };

  this.focus = index => {
    index = this.clampIndex(index);
    if (!this.nodes[index]) return;
    if (this.nodes[this.focusedIndex]) {
        this.nodes[this.focusedIndex].setAttribute(
          HIGHLIGHTED_ELEMENT_ATTR,
          false
        );
        this.nodes[this.focusedIndex].blur();
    }

    this.nodes[index].setAttribute(HIGHLIGHTED_ELEMENT_ATTR, true);
    this.nodes[index].focus();
    this.nodes[index].scrollIntoViewIfNeeded();

    this.focusedIndex = index;
  };

  this.focusNext = () => {
    this.focus(this.focusedIndex + 1);
  };

  this.focusPrevious = () => {
    this.focus(this.focusedIndex - 1);
  };

  this.toggleTintColor = (path, tag) => {
    let elements = document.querySelectorAll(path) || [];
    console.log("toggleTint", path, elements, tag);
    elements.forEach(item => {
      let attr = `${TINTED_ELEMENT_CLASS}-${tag}`;
      if (item.hasAttribute(attr)) {
        item.removeAttribute(attr);
      } else {
        item.setAttribute(attr, "true");
      }
    });

    elements[0] && elements[0].scrollIntoViewIfNeeded();
  };

  this.removeTintColor = path => {
    let elements = document.querySelectorAll(path) || [];
    console.log("toggleTint", path, elements, tag);
    elements.forEach(item => {
      let attr = `${TINTED_ELEMENT_CLASS}-${tag}`;
      if (item.hasAttribute(attr)) {
        item.removeAttribute(attr);
      }
    });
  };

  this.clampIndex = function(index) {
    return Math.min(Math.max(index, 0), this.nodes.length);
  };

  this.reset = () => {
    this.focusedIndex = -1;
    this.refresh();
  };

  this.getEachNodeCount = () => {
    return targetPath.map(item => {
      let collections = document.querySelectorAll(item) || [];
      return {
        path: item,
        count: collections.length
      };
    });
  };

  this.refresh();
}
