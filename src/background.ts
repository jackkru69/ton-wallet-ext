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
import { store } from "./store/index";

import { TonService } from "@/ton/ton.service";

export const tonService = new TonService(store.state.network);

// setInterval(async function() {
//   console.log(tonService);
// }, 5000);

store.subscribe((mutation) => {
  if (mutation.type === "setNetwork") {
    tonService.setNetwork(mutation.payload);
  }
});
