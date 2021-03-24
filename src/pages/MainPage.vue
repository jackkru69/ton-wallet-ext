<template>
  <div class="v-main-page py-8">
    <Inner><v-btn @click="onClick">1111</v-btn></Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard } from "vuetify/lib";
// import { isEmpty } from "lodash";
import { balancesModuleMapper } from "@/store/modules/balances";

const Mappers = Vue.extend({
  computed: {
    ...balancesModuleMapper.mapGetters(["balancesTotal"]),
  },
  methods: {
    ...balancesModuleMapper.mapActions(["fetchBalanceTotal"]),
  },
});

@Component({
  components: { Inner, VCard },
  // methods: { isEmpty },
})
export default class MainPage extends Mappers {
  onClick() {
    browser.runtime.sendMessage({});
    console.log(1);
  }
}
</script>

<style lang="sass" scoped>
.v-main-page
</style>