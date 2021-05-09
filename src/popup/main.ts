import Vue from "vue";
import App from "./App.vue";
import router from "../router";
import { store } from "../store";
import Clipboard from "v-clipboard";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const vco = require("v-click-outside");

import "@mdi/font/css/materialdesignicons.min.css";
import vuetify from "../plugins/vuetify";

Vue.use(vco);
Vue.use(Clipboard.install);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
