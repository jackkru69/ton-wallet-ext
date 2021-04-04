import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import { accounts } from "./modules/accounts";

export type Network = "http://net.ton.dev" | "http://main.ton.dev";
class RootState {
  network: Network = "http://net.ton.dev";
}

class RootGetters extends Getters<RootState> {
  public get network() {
    return this.state.network;
  }
}

class RootMutations extends Mutations<RootState> {
  public setNetwork(payload: Network) {
    this.state.network = payload;
  }
}

class RootActions extends Actions<RootState, RootGetters, RootMutations, RootActions> {
  public setNetwork(payload: Network) {
    this.mutations.setNetwork(payload);
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
