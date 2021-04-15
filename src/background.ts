import { store } from "./store/index";
import { TonService } from "@/ton/ton.service";

// @ts-ignore
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // @ts-ignore
    browser.tabs.create({ url: "index.html#/initialize" });
  }
});
// @ts-ignore
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(request, sender, sendResponse);
  // @ts-ignore
  // browser.tabs.executeScript({
  //   file: "content-script.js",
  // });
});

export const tonService = new TonService();
// @ts-ignore
store.restored.then(() => {
  const network = store.getters["networks/getNetworkById"](store.state.activeNetworkID);

  store.commit("setIsStoreRestored", true);
  tonService.setNetwork(network.server);
  console.log("background.js/store", store);
  console.log("background.js/tonService", tonService);
});

store.subscribe((mutation, state) => {
  if (mutation.type === "setNetwork") {
    const network = store.getters["networks/getNetworkById"](mutation.payload);
    tonService.setNetwork(network.server);
  }
  // console.log(store);
});
