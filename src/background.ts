// @ts-ignore
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // @ts-ignore
    browser.tabs.create({ url: "index.html#/initialize" });
  }
});

// @ts-ignore
// browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log("Hello from the background");
//   // @ts-ignore
//   browser.tabs.executeScript({
//     file: "content-script.js",
//   });
// });
//
import { store } from "./store/index";

import { TonService } from "@/ton/ton.service";

export const tonService = new TonService();
// @ts-ignore
store.restored.then(() => {
  const network = store.getters["networks/getNetworkById"](store.state.activeNetworkID);

  store.dispatch("setIsStoreRestored", true);
  tonService.setNetwork(network.server);
  console.log("background.js/store", store);
  console.log("background.js/tonService", tonService);
});
// setInterval(async function() {
//   console.log(tonService);
// }, 5000);

store.subscribe((mutation, state) => {
  if (mutation.type === "setNetwork") {
    console.log(state);
    const network = store.getters["networks/getNetworkById"](mutation.payload);
    tonService.setNetwork(network.server);
  }
});
