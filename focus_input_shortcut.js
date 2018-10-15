const focus_input_shortcut = {
  init() {
    window.addEventListener(
      "keyup",
      e => {
        if (e.defaultPrevented) {
          return;
        }

        if (e.code === "KeyS" && e.altKey) {
          this.tryFocusInput(e);
        } else if (e.key === "Alt") {
          this._waitingKeyS = true;
          setTimeout(() => {
            this._waitingKeyS = false;
          }, 300);
        } else if (e.key === "s" && this._waitingKeyS) {
          this.tryFocusInput(e);
        }
      },
      false
    );
  },
  tryFocusInput(e) {
    e.stopPropagation();
    e.preventDefault();

    var input = findFirstValidInput();
    console.log("input", input);
    input && input.focus();
  }
};
function findFirstValidInput() {
  var sel = document.querySelector(
    // these are sane versions of what search field is named
    "input[id=search], input[name=search]," +
      "input[id*=search], input[name*=search]," +
      "input[class*=search]," +
      // and these are purely empirical
      "input[name=q], [id*=search] input[type=text], [id*=search] input[type=search]," +
      "[id=lst-ib] input"
  );

  if (!sel) {
    sel = document.querySelector("input:not([type=hidden])");
  }

  return sel;
}
