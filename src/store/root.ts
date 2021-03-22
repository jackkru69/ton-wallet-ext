import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import { balances } from "./modules/balances";

class RootState {
}

class RootGetters extends Getters<RootState> {

}

class RootMutations extends Mutations<RootState> {

}

class RootActions extends Actions<RootState, RootGetters, RootMutations, RootActions> {

}

export const root = new Module({
  state: RootState,
  getters: RootGetters,
  mutations: RootMutations,
  actions: RootActions,
  modules: {  balances},
});

export const rootModuleMapper = createMapper(root);
