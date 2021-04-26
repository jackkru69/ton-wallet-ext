import { store } from "./store/index";
import { TonService } from "@/ton/ton.service";

browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    browser.tabs.create({ url: "index.html#/initialize" });
  }
});
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request, sender, sendResponse);
});

export const tonService = new TonService();
store.restored.then(() => {
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
