import Vue from "vue";
import App from "./App.vue";
import router from "../router";
import { store } from "../store";
import Clipboard from "v-clipboard";

// eslint-disable-next-line @typescript-eslint/no-var-requires

import "@mdi/font/css/materialdesignicons.min.css";
import vuetify from "../plugins/vuetify";

Vue.config.devtools = true;

Vue.use(Clipboard);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
