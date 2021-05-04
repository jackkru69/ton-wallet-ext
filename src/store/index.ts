import Vue from "vue";
import Vuex from "vuex";
import { createStore } from "vuex-smart-module";
import { root } from "./root";
// @ts-ignore
import createMutationsSharer from "vuex-shared-mutations";
import VuexPersistence from "vuex-persist";

Vue.use(Vuex);

export const browserVuexLocalStorage = {
  setItem: (key: string | number, value: any) => {
    const newItemCache: any = {}; // note: storage.local needs an object with a property of the key name, so newItemCache is not what we're saving, value is.
    newItemCache[key] = value;
    // @ts-ignore
    return browser.storage.local.set(newItemCache);
  },
  getItem: (key: any) => {
    // @ts-ignore
    return browser.storage.local.get(key).then((data: any) => data[key]);
  },
  removeItem: (key: string | string[]) => {
    // @ts-ignore
    return browser.storage.local.remove(key);
  },
  clear: () => {
    // @ts-ignore
    return browser.storage.local.clear();
  },
  // @ts-ignore
  length: () => browser.storage.local.get("vuex").then((data: any) => data["vuex"].length),
  key: (): Promise<string> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve("vuex");
      }, 100);
    }),
};

export const vuexLocal = new VuexPersistence({
  storage: browserVuexLocalStorage,
  asyncStorage: true,
  key: "vuex",
  modules: ["accounts", "wallet", "keystore"],
});

export const store = createStore(root, {
  strict: process.env.NODE_ENV !== "production",

  plugins: [
    createMutationsSharer({
      predicate: [
        "accounts/addAccountMut",
        "accounts/addNetworkToAccount",
        "accounts/changeAccountName",
        "accounts/deleteAccount",
        "accounts/deleteAllAccounts",
        "accounts/setIsExist",
        "accounts/setPendingTransactions",
        "accounts/setTransactions",
        "accounts/updateBalanceByAddressMut",
        "keystore/removeAllKey",
        "keystore/removeKey",
        "keystore/saveKeyMut",
        "networks/addNetwork",
        "wallet/setActiveAccountAddress",
        "wallet/setIsStoreRestored",
        "wallet/setNetwork",
      ],
    }),
    vuexLocal.plugin,
  ],
});
