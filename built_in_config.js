const BUILT_IN_HOST = {
  "www.baidu.com": [
    "DIV.result.c-container H3.t:not([id]) A:not([class]):not([id])", // search results
    "DIV.wrapper_l#wrapper DIV:not([class])#wrapper_wrapper DIV.container_l#container DIV:not([class])#page A:not([class]):not([id])", // page number
    "DIV.container_l#container DIV:not([class])#page A.n:not([id])" // page next/previous
  ],
  "www.google.com.hk": [
    "DIV.rc:not([id]) DIV.r:not([id]) A:not([class]):not([id])", // search results
    "DIV.col:not([id]) DIV:not([class])#center_col DIV:not([class]):not([id]) DIV:not([class])#foot SPAN:not([class])#xjs DIV:not([class])#navcnt TABLE:not([class])#nav TBODY:not([class]):not([id]) TR:not([class]):not([id]) TD:not([class]):not([id]) A.fl:not([id])", // page number
    "TD.b.navend:not([id]) A.pn#pnnext", // page next
    "TD.b.navend:not([id]) A.pn#pnprev" // page previous
  ],
  "www.google.com": [
    "DIV.rc:not([id]) H3.r:not([id]) A:not([class]):not([id])", // search results
    "DIV.col:not([id]) DIV:not([class])#center_col DIV:not([class]):not([id]) DIV:not([class])#foot SPAN:not([class])#xjs DIV:not([class])#navcnt TABLE:not([class])#nav TBODY:not([class]):not([id]) TR:not([class]):not([id]) TD:not([class]):not([id]) A.fl:not([id])", // page number
    "TD.b.navend:not([id]) A.pn#pnnext", // page next
    "TD.b.navend:not([id]) A.pn#pnprev" // page previous
  ],
  "www.google.co.jp": [
    "DIV.rc:not([id]) DIV.r:not([id]) A:not([class]):not([id])", // search results
    "DIV.col:not([id]) DIV:not([class])#center_col DIV:not([class]):not([id]) DIV:not([class])#foot SPAN:not([class])#xjs DIV:not([class])#navcnt TABLE:not([class])#nav TBODY:not([class]):not([id]) TR:not([class]):not([id]) TD:not([class]):not([id]) A.fl:not([id])", // page number
    "TD.b.navend:not([id]) A.pn#pnnext", // page next
    "TD.b.navend:not([id]) A.pn#pnprev" // page previous
  ]
};

const built_in_config = {
  init() {
    return new Promise(resolve => {
      chrome.storage.sync.get("HAVE_LOADED_BUILT_IN_CONFIG", result => {
        if (!result.HAVE_LOADED_BUILT_IN_CONFIG) {
          let data = {
            HOST_LIST: Object.keys(BUILT_IN_HOST),
            HAVE_LOADED_BUILT_IN_CONFIG: true,
            ...BUILT_IN_HOST
          };
          chrome.storage.sync.set(data, function() {
            console.log("set initial data succeed", data);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
};
