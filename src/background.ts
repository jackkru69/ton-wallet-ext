// @ts-ignore
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // @ts-ignore
    browser.tabs.create({ url: "index.html#/initialize" });
  }
});

// @ts-ignore
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Hello from the background");
  // @ts-ignore
  browser.tabs.executeScript({
    file: "content-script.js",
  });
});
//
// import { store } from "./store/index";

// Increase timer each second
setInterval(async function() {
  // store.dispatch("pushAct");
}, 5000);
