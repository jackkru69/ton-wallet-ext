import Vue from "vue";
import App from "./App.vue";
import router from "../router";
import { store } from "../store";
import Clipboard from "v-clipboard";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const vco = require("v-click-outside");

import "@mdi/font/css/materialdesignicons.min.css";
import vuetify from "../plugins/vuetify";
import { TonService } from "@/ton/ton.service";

Vue.config.devtools = true;

Vue.use(vco);
Vue.use(Clipboard);

Vue.config.productionTip = false;

const tonService = new TonService();

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

export { tonService };
