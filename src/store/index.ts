import Vue from "vue";
import Vuex from "vuex";
import { createStore } from "vuex-smart-module";
import { root } from "./root";
import createPersistedState from "vuex-persistedstate";
// @ts-ignore
import createMutationsSharer from "vuex-shared-mutations";

Vue.use(Vuex);

export const store = createStore(root, {
  strict: process.env.NODE_ENV !== "production",
  plugins: [createMutationsSharer({ predicate: ["setNetwork", "createNewAccount"] }), createPersistedState()],
});
