<template>
  <v-app-bar class="v-app-bar" app :height="72" flat>
    <img class="v-app-bar__logo mr-4" src="@/assets/img/freeton.png" alt="" />
    <VSpacer />
    <VSelect
      :items="networks"
      v-model="modelNetwork"
      item-text="title"
      item-value="value"
      hide-details
      dense
      outlined
      class="v-app-bar__select"
    />
  </v-app-bar>
</template>


  <script lang="ts">
import { Network, rootModuleMapper } from "@/store/root";
import { Component, Vue } from "vue-property-decorator";
import { VSwitch, VBtn, VSelect, VSpacer } from "vuetify/lib";

const Mappers = Vue.extend({
  methods: {
    ...rootModuleMapper.mapActions(["setNetwork"]),
  },
  computed: {
    ...rootModuleMapper.mapGetters(["network"]),
    modelNetwork: {
      get() {
        return this.network;
      },
      set(value: Network) {
        this.setNetwork(value);
      },
    },
  },
});

@Component({ components: { VSwitch, VBtn, VSelect, VSpacer } })
export default class Header extends Mappers {
  networks = [
    { title: "TON testnet network", value: "testnet" },
    { title: "TON mainnet network", value: "mainnet" },
  ];
}
</script>

<style lang="sass" scoped>
.v-app-bar
  &__logo
    width: 48px
    height: 48px
  &__select
    max-width: 250px
</style>