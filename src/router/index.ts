import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import InitializePage from "@/pages/InitializePage.vue";
import AddAccountPage from "@/pages/AddAccountPage.vue";
import TransferPage from "@/pages/TransferPage.vue";
import RestoreWalletPage from "@/pages/RestoreWalletPage.vue";

import { store } from "@/store";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "MainPage",
    component: MainPage,
  },
  {
    path: "/initialize",
    name: "Initialize",
    component: InitializePage,
  },
  {
    path: "/initialize/create",
    name: "AddAccount",
    component: AddAccountPage,
  },
  {
    path: "/initialize/restore",
    name: "RestoreWallet",
    component: RestoreWalletPage,
  },
  {
    path: "/transfer",
    name: "TransferPage",
    component: TransferPage,
  },
];

const router = new VueRouter({
  // mode: "history",
  // base: "index.html",
  routes,
});

const waitForStorageToBeReady = async (to: any, from: any, next: () => void) => {
  // @ts-ignore
  store.restored.then(() => next());
};
router.beforeEach(waitForStorageToBeReady);

export default router;
