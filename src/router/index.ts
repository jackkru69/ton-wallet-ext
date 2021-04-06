import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import InitializePage from "@/pages/InitializePage.vue";
import CreateWalletPage from "@/pages/CreateWalletPage.vue";
import TransferPage from "@/pages/TransferPage.vue";

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
    name: "CreateWallet",
    component: CreateWalletPage,
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

export default router;
