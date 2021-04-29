import { store } from "./store/index";
import { TonService } from "@/ton/ton.service";
import TonContract from "./ton/ton.contract";
import { contracts } from "./store/modules/accounts";
// @ts-ignore
browser.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    // @ts-ignore
    browser.tabs.create({ url: "index.html#/initialize" });
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
// @ts-ignore
const extensionId = browser.runtime.id;

const handleMessage = async (request: any, sender: any) => {
  const result: any = {};
  console.log(sender);
  console.log(request);
  try {
    if (extensionId !== sender.id) {
      throw "extensionId <> senderId";
    }
    const isInternalRequest = sender.origin === `chrome-extension://${extensionId}`;
    let task;

    if (isInternalRequest) {
      return;
    } else {
      result.requestId = request.requestId;
      task = {
        requestId: request.requestId,
        method: request.method,
        data: request.data,
        isInteractive: true,
        tabId: sender.tab.id,
      };
    }

    if (task.isInteractive) {
      if (task.method === "sendTransaction") {
        // @ts-ignore

        browser.windows.create({
          url: "index.html",
          type: "popup",
          width: 357,
          height: 600,
          left: screen.width - 357,
          top: 0,
        });
        // const contract = new TonContract({
        //   client: tonService.client,
        //   tonPackage: contracts[account.walletType],
        //   name: account.walletType,
        //   keys: keypair,
        //   address: account.address,
        // });
      }

      result.data = {};
      result.code = 0;
    }
    // else {
    //   if (!isInternalRequest && !(await store.dispatch("wallet/isLoggedIn"))) {
    //     await new Promise((resolve) => {
    //       //@ts-ignore
    //       browser.windows.create(
    //         {
    //           url: "index.html",
    //           type: "popup",
    //           width: 310,
    //           height: 536,
    //           left: 0,
    //           top: 0,
    //         },
    //         //@ts-ignore
    //         (popup) => {
    //           resolve(popup);
    //         }
    //       );
    //     });
    //     await store.dispatch("wallet/waitLoggedIn");
    //   }
    //   result.data = isInternalRequest ? () => {} : () => {};
    //   result.code = 0;
    // }
  } catch (e) {
    console.error(e);
    result.code = 1;
    result.error = e.toString();
  }
  return result;
};

// @ts-ignore
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (undefined === request.method) {
    return;
  }
  handleMessage(request, sender).then((result) => sendResponse(result));
  return true;
});
