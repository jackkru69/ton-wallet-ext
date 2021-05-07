import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import InitializePage from "@/pages/InitializePage.vue";
import AddAccountPage from "@/pages/AddAccountPage.vue";
import TransferPage from "@/pages/TransferPage.vue";
import RestoreWalletPage from "@/pages/RestoreWalletPage.vue";
import LockScreenPage from "@/pages/LockScreenPage.vue";
import EasyAddPage from "@/pages/EasyAddPage.vue";
import ChangePasswordPage from "@/pages/ChangePasswordPage.vue";
import ConfirmTransactionPage from "@/pages/ConfirmTransactionPage.vue";
import ProposeTransactionPage from "@/pages/ProposeTransactionPage.vue";

import { store } from "@/store";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "MainPage",
    component: MainPage,
    meta: { isRequiredAuth: true, isInitPages: false },
  },
  {
    path: "/lock",
    name: "LockScreen",
    component: LockScreenPage,
    meta: { isRequiredAuth: false, isInitPages: false },
  },
  {
    path: "/easy-add",
    name: "EasyAddPage",
    component: EasyAddPage,
    meta: { isRequiredAuth: false, isInitPages: true },
  },
  {
    path: "/initialize",
    name: "Initialize",
    component: InitializePage,
    meta: { isRequiredAuth: false, isInitPages: true },
  },
  {
    path: "/initialize/create",
    name: "AddAccount",
    component: AddAccountPage,
    meta: { isRequiredAuth: false, isInitPages: true },
  },
  {
    path: "/initialize/restore",
    name: "RestoreWallet",
    component: RestoreWalletPage,
    meta: { isRequiredAuth: false, isInitPages: true },
  },
  {
    path: "/transfer",
    name: "TransferPage",
    component: TransferPage,
    meta: { isRequiredAuth: true, isInitPages: false },
  },
  {
    path: "/change-password",
    name: "ChangePasswordPage",
    component: ChangePasswordPage,
    meta: { isRequiredAuth: true, isInitPages: false },
  },
  {
    path: "/confirm-transaction",
    name: "ConfirmTransactionPage",
    component: ConfirmTransactionPage,
    meta: { isRequiredAuth: true, isInitPages: false },
  },
  {
    path: "/propose-transaction",
    name: "ProposeTransactionPage",
    component: ProposeTransactionPage,
    meta: { isRequiredAuth: true, isInitPages: false },
  },
];

const router = new VueRouter({
  // mode: "history",
  // base: "index.html",
  routes,
});

const waitForStorageToBeReady = async (to: any, from: any, next: (v?: any) => void) => {
  // @ts-ignore
  store.restored.then(() => {
    if (store.getters["accounts/accountsCount"] === 0 && !to.meta.isInitPages) {
      next("/initialize");
    } else if (to.path !== "/lock" && store.getters.getIsLocked && to.meta.isRequiredAuth) {
      next("/lock");
    }
    next();
  });
};
router.beforeEach(waitForStorageToBeReady);

export default router;
