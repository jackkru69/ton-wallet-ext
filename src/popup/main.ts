import Vue from "vue";
import App from "./App.vue";
import router from "../router";
import { store } from "../store";
import Clipboard from "v-clipboard";

import "@mdi/font/css/materialdesignicons.min.css";
import vuetify from "../plugins/vuetify";

Vue.use(Clipboard.install);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
