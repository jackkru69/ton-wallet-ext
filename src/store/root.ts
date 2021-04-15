import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import { accounts } from "./modules/accounts";
import { networks } from "./modules/networks";

export type Network = "http://0.0.0.0" | "http://net.ton.dev" | "http://main.ton.dev";
class RootState {
  isStoreRestored = false;
  activeNetworkID = 0;
  activeAccountID = 0;
  subscriptionBalanceHandle: number | null = null;
  subscriptionTxsHandle: number | null = null;
}

class RootGetters extends Getters<RootState> {
  public get isStoreRestored(): boolean {
    return this.state.isStoreRestored;
  }

  public get activeNetworkID() {
    return this.state.activeNetworkID;
  }

  public get activeAccountID() {
    return this.state.activeAccountID;
  }

  public get subscriptionBalanceHandle(): number | null {
    return this.state.subscriptionBalanceHandle;
  }

  public get subscriptionTxsHandle(): number | null {
    return this.state.subscriptionTxsHandle;
  }
}
class RootMutations extends Mutations<RootState> {
  setIsStoreRestored(payload: boolean) {
    this.state.isStoreRestored = payload;
  }

  setNetwork(payload: number) {
    this.state.activeNetworkID = payload;
  }

  setActiveAccountID(payload: number) {
    this.state.activeAccountID = payload;
  }

  setSubscriptionBalanceHandle(payload: number | null) {
    this.state.subscriptionBalanceHandle = payload;
  }
}

class RootActions extends Actions<RootState, RootGetters, RootMutations, RootActions> {}

export const root = new Module({
  state: RootState,
  getters: RootGetters,
  mutations: RootMutations,
  actions: RootActions,
  modules: {
    accounts,
    networks,
  },
});

export const rootModuleMapper = createMapper(root);
