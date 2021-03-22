<template>
  <VNavigationDrawer app clipped :value="isOpen">
    <v-list expand>
      <v-list-item link :to="`/`">
        <v-list-item-title>Main page</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/providers`">
        <v-list-item-title>Providers</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/commissions`">
        <v-list-item-title>Commissions</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/commission-histories`">
        <v-list-item-title>Commission histories</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/balances`">
        <v-list-item-title>Balances</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/deposits`">
        <v-list-item-title>Deposits</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/withdraws`">
        <v-list-item-title>Withdraws</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/transfers`">
        <v-list-item-title>Transfers</v-list-item-title>
      </v-list-item>
    </v-list>
  </VNavigationDrawer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  VList,
  VListItem,
  VListItemTitle,
  VNavigationDrawer,
} from "vuetify/lib";

const Mappers = Vue.extend({
  components: {
    VList,
    VListItem,
    VListItemTitle,
    VNavigationDrawer,
  },
});

@Component
export default class Aside extends Mappers {
  @Prop() isOpen: boolean;
}
</script>
