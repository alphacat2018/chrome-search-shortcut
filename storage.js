const storage = {
  init() {
    return new Promise((resolve, reject) => {
      this.hosts = [];
      this.hostElementsMap = {};

      chrome.storage.sync.get("HOST_LIST", result => {
        this.hosts = result.HOST_LIST || [];
        console.log("HOST_LIST", this.hosts);

        if (this.hosts && this.hosts.length > 0) {
          let hostKeys = this.hosts;
          chrome.storage.sync.get(hostKeys, rez => {
            console.log("hosts", rez);
            this.hostElementsMap = rez;

            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  },

  getElementsOfthisHost(host) {
    let result = this.hostElementsMap[host] || [];
    return [...result];
  },

  appendElementToHost(host, element) {
    let hostIndex = this.hosts.findIndex(i => i == host);
    if (hostIndex < 0) {
      this.hosts.push(host);
      chrome.storage.sync.set({ HOST_LIST: this.hosts }, function() {
        console.log("HOST_LIST updated", this.hosts);
      });
    }

    this.hostElementsMap[host] = [
      ...(this.hostElementsMap[host] || []),
      element
    ];
    this.updateElementsOfHost(host, this.hostElementsMap[host]);
  },

  removeElementFromHost(host, element) {
    console.log(
      "this.hostElementsMap[host]",
      this.hostElementsMap[host],
      host,
      this.hostElementsMap
    );
    if (!this.hostElementsMap[host] || this.hostElementsMap[host].length == 0)
      return;

    let index = this.hostElementsMap[host].findIndex(i => i == element);
    console.log("indexindex", index);
    if (index < 0) return;
    this.hostElementsMap[host].splice(index, 1);

    this.updateElementsOfHost(host, this.hostElementsMap[host]);

    if (this.hostElementsMap[host].length == 0) {
      let hostIndex = this.hosts.findIndex(i => i == host);
      if (hostIndex < 0) return;

      this.hosts.splice(hostIndex, 1);
      chrome.storage.sync.set({ HOST_LIST: this.hosts }, function() {
        console.log("HOST_LIST updated", this.hosts);
      });
    }
  },

  removeAllElementsOfHost(host) {
    console.log("removeAllElementsOfHost", host);
    this.hostElementsMap[host] = [];
    this.updateElementsOfHost(host, this.hostElementsMap[host]);

    let hostIndex = this.hosts.findIndex(i => i == host);
    if (hostIndex < 0) return;

    this.hosts.splice(hostIndex, 1);
    console.log("this.hosts", this.hosts, hostIndex, this.hosts);
    chrome.storage.sync.set({ HOST_LIST: this.hosts }, function() {
      console.log("HOST_LIST updated", this.hosts);
    });
  },

  updateElementsOfHost(host, value) {
    console.log("updateElementsOfHost", host, value);
    // let data = {};
    // data[`HOST_${host}`] = value
    if (!value || value.length == 0) {
      chrome.storage.sync.remove(host, () => {
        console.log("hostElementsMap removed", host);
      });
    } else {
      chrome.storage.sync.set({ [host]: value }, () => {
        console.log(
          "hostElementsMap updated",
          host,
          this.hostElementsMap[host]
        );
      });
    }
  }
};
