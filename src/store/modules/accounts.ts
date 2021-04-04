import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

class AccountsState {
  accounts = [];
}

class AccountsGetters extends Getters<AccountsState> {}

class AccountsMutations extends Mutations<AccountsState> {}

class AccountsActions extends Actions<AccountsState, AccountsGetters, AccountsMutations, AccountsActions> {}

export const accounts = new Module({
  state: AccountsState,
  getters: AccountsGetters,
  mutations: AccountsMutations,
  actions: AccountsActions,
});

export const accountsModuleMapper = createMapper(accounts);
