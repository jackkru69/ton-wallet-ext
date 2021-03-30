import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

export type Network = "testnet" | "mainnet";
class RootState {
  network: Network = "testnet";
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
});

export const rootModuleMapper = createMapper(root);
