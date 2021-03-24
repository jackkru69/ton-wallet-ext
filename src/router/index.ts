import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import MainPage from "@/pages/MainPage.vue";
import InitializePage from "@/pages/initialize/InitializePage.vue";

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
];

const router = new VueRouter({
  // mode: "history",
  // base: "index.html",
  routes,
});

export default router;
