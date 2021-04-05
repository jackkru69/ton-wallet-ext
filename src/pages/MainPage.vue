<template>
  <div class="v-main-page">
    <Inner>
      <div class="v-main-page__header">1</div>
      <v-divider></v-divider>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard } from "vuetify/lib";
import {
  AccountInterface,
  accountsModuleMapper,
} from "@/store/modules/accounts";
import { getBalance, sendGrams } from "@/ton/ton.utils";
import { tonService } from "@/background";
import { rootModuleMapper } from "@/store/root";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters(["activeAccountID"]),

    ...accountsModuleMapper.mapGetters(["getAccountById"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["createNewAccount"]),
  },
});

@Component({
  components: { Inner, VCard },
  // methods: { isEmpty },
})
export default class MainPage extends Mappers {
  // async created() {
  //   const account: AccountInterface = this.getAccountById(this.activeAccountID);
  // }
}
</script>





<style lang="sass">
.v-main-page
  &__header
    height: 64px
    display: flex
    align-items: center
    justify-content: space-between
</style>