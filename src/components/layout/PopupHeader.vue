<template>
  <v-app-bar class="v-app-bar" app :height="72" flat>
    <img class="v-app-bar__logo mr-4" src="@/assets/img/freeton.png" alt="" />
    <VSpacer />
    <VSelect
      :items="networks"
      v-model="network"
      item-text="title"
      item-value="value"
      hide-details
      dense
      outlined
    />
  </v-app-bar>
</template>


  <script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { VSwitch, VBtn, VSelect, VSpacer } from "vuetify/lib";
import { rootModuleMapper } from "@/store/root";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters([]),
  },
  methods: { ...rootModuleMapper.mapActions([]) },
});

@Component({ components: { VSwitch, VBtn, VSelect, VSpacer } })
export default class Header extends Mappers {
  network = "testnet";
  networks = [
    { title: "testnet", value: "testnet" },
    { title: "mainnet", value: "mainnet" },
  ];
}
</script>

<style lang="sass" scoped>
.v-app-bar
  &__logo
    width: 48px
    height: 48px
</style>