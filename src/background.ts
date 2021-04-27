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
  console.log(request, sender, sendResponse);
  sendResponse("response");
  if (request === "refresh") {
    store.commit("wallet/setNetwork", 1);
  }
});

export const tonService = new TonService();

(store as any).restored.then(() => {
  const network = store.getters["networks/getNetworkById"](store.state.wallet.activeNetworkID);

  store.commit("wallet/setIsStoreRestored", true);
  tonService.setNetwork(network.server);
  console.log("background.js/store", store);
  console.log("background.js/tonService", tonService);
});

store.subscribe((mutation) => {
  if (mutation.type === "wallet/setNetwork") {
    const network = store.getters["networks/getNetworkById"](mutation.payload);
    tonService.setNetwork(network.server);
  }
});
