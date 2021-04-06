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
    <VMenu
      bottom
      max-width="320px"
      min-width="320px"
      max-height="526px"
      rounded
      offset-y
    >
      <template v-slot:activator="{ on }">
        <VBtn class="ml-4" icon x-large v-on="on">
          <VAvatar color="blue" size="48"> </VAvatar>
        </VBtn>
      </template>
      <VCard>
        <v-subheader>Accounts</v-subheader>
        <v-divider></v-divider>
        <VList class="v-app-bar__list" max-height="228px">
          <VListItemGroup v-model="modelActiveAccountID" color="primary">
            <VListItem v-for="(item, i) in accounts" :key="i">
              <VListItemContent>
                <VListItemTitle v-text="item.name"></VListItemTitle>
              </VListItemContent>
            </VListItem>
          </VListItemGroup>
        </VList>
        <v-divider></v-divider>
        <VList nav>
          <VListItem link>
            <VListItemContent>
              <VListItemTitle>Add account</VListItemTitle>
            </VListItemContent>
          </VListItem>
          <VListItem link>
            <VListItemContent>
              <VListItemTitle>Restore account</VListItemTitle>
            </VListItemContent>
          </VListItem>
        </VList>
      </VCard>
    </VMenu>
  </v-app-bar>
</template>


  <script lang="ts">
import { accountsModuleMapper, networks } from "@/store/modules/accounts";
import { Network, rootModuleMapper } from "@/store/root";
import { Component, Vue } from "vue-property-decorator";

const Mappers = Vue.extend({
  methods: {
    ...rootModuleMapper.mapActions(["setNetwork", "setActiveAccountID"]),
  },
  computed: {
    ...rootModuleMapper.mapGetters(["network", "activeAccountID"]),
    ...accountsModuleMapper.mapGetters(["accounts"]),

    modelNetwork: {
      get() {
        return this.network;
      },
      set(value: Network) {
        this.setNetwork(value);
      },
    },
    modelActiveAccountID: {
      get() {
        return this.activeAccountID;
      },
      set(value: number) {
        this.setActiveAccountID(value);
      },
    },
  },
});

@Component
export default class Header extends Mappers {
  data() {
    return {
      networks,
    };
  }
}
</script>

<style lang="sass" scoped>
.v-app-bar
  &__logo
    width: 48px
    height: 48px
  &__select
    max-width: 250px
  &__list
    overflow-y: auto
</style>