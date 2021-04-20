import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import { accounts } from "./modules/accounts";
import { networks } from "./modules/networks";
import { wallet } from "./modules/wallet";
import { keystore } from "./modules/keystore";

class RootState {
  isLocked = true;
}

class RootGetters extends Getters<RootState> {
  public get getIsLocked(): boolean {
    return this.state.isLocked;
  }
}
class RootMutations extends Mutations<RootState> {
  public setIsLocked(v: boolean) {
    this.state.isLocked = v;
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
    wallet,
    keystore,
  },
});

export const rootModuleMapper = createMapper(root);
