import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import { accounts } from "./modules/accounts";
import { networks } from "./modules/networks";

export type Network = "http://0.0.0.0" | "http://net.ton.dev" | "http://main.ton.dev";
class RootState {
  isStoreRestored = false;
  activeNetworkID = 0;
  activeAccountID = 0;
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
}

class RootActions extends Actions<RootState, RootGetters, RootMutations, RootActions> {
  public setIsStoreRestored(payload: boolean) {
    this.mutations.setIsStoreRestored(payload);
  }

  public setNetwork(payload: number) {
    this.mutations.setNetwork(payload);
  }

  public setActiveAccountID(payload: number) {
    this.mutations.setActiveAccountID(payload);
  }
}

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
