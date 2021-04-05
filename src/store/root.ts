import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import { accounts } from "./modules/accounts";

export type Network = "http://0.0.0.0" | "http://net.ton.dev" | "http://main.ton.dev";
class RootState {
  network: Network = "http://0.0.0.0";
  activeAccountID: null | number = null;
}

class RootGetters extends Getters<RootState> {
  public get network() {
    return this.state.network;
  }

  public get activeAccountID() {
    return this.state.activeAccountID;
  }
}

class RootMutations extends Mutations<RootState> {
  setNetwork(payload: Network) {
    this.state.network = payload;
  }

  setActiveAccountID(payload: number) {
    this.state.activeAccountID = payload;
  }
}

class RootActions extends Actions<RootState, RootGetters, RootMutations, RootActions> {
  public setNetwork(payload: Network) {
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
  },
});

export const rootModuleMapper = createMapper(root);
