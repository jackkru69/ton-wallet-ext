<template>
  <div class="v-main-page py-8">
    <Inner>1</Inner>
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
  async created() {
    await this.fetchBalanceTotal();
  }
}
</script>

<style lang="sass" scoped>
.v-main-page
  &__cards
    display: grid
    grid-template-columns: 1fr 1fr
    grid-gap: 16px
    box-sizing: border-box
</style>