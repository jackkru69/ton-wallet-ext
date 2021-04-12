<template>
  <div class="v-main-page">
    <DeployModal v-model="isDeployModalOpen" />
    <Inner>
      <div class="v-main-page__menu-bar">
        <VTooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <VBtn
              plain
              v-clipboard="() => account.address"
              class="v-main-page__menu-bar-selected-account"
              v-bind="attrs"
              v-on="on"
              rounded
            >
              <template v-slot:default>
                <div>
                  <div>{{ account.name }}</div>
                  <div>{{ sliceString(account.address) }}</div>
                </div>
              </template>
            </VBtn>
          </template>
          <span>Copy to clipboard</span>
        </VTooltip>
        <VMenu left offset-y>
          <template v-slot:activator="{ attrs, on }">
            <VBtn
              icon
              v-bind="attrs"
              v-on="on"
              class="v-main-page__menu-bar-dots"
            >
              <VIcon>mdi-dots-vertical</VIcon>
            </VBtn>
          </template>
          <VList nav>
            <VListItem>
              <VListItemTitle>account details</VListItemTitle>
            </VListItem>
            <VListItem link>
              <VListItemTitle>explorer</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </div>
      <v-divider></v-divider>
      <div class="d-flex justify-center my-4">
        <h1>
          {{
            baseToAssetAmount(account.tokens[0].balance, "TON") +
            " " +
            account.tokens[0].symbol
          }}
        </h1>
      </div>

      <div class="d-flex justify-center align center">
        <VBtn
          v-if="activeNetworkID === 0"
          :loading="isAirdropPending"
          @click="airdrop"
          class="mr-4"
          icon
          ><VIcon>mdi-water</VIcon></VBtn
        >
        <VBtn @click="transfer" icon><VIcon :width="40">mdi-send</VIcon></VBtn>
      </div>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import DeployModal from "@/components/DeployModal.vue";

import { VCard } from "vuetify/lib";
import {
  AccountInterface,
  accountsModuleMapper,
} from "@/store/modules/accounts";

import { rootModuleMapper } from "@/store/root";
import { baseToAssetAmount, sliceString } from "@/utils";
import { sendGrams } from "@/ton/ton.utils";
import { tonService } from "@/background";
import { store } from "@/store";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters([
      "activeAccountID",
      "activeNetworkID",
      "isStoreRestored",
    ]),
    ...accountsModuleMapper.mapGetters(["getAccountById"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["updateBalanceById"]),
  },
});

@Component({
  components: { Inner, VCard, DeployModal },
  methods: { sliceString, baseToAssetAmount },
})
export default class MainPage extends Mappers {
  isAirdropPending = false;
  isDeployModalOpen = false;

  public get account(): AccountInterface | undefined {
    return this.getAccountById(this.activeAccountID);
  }
  public get accountAndNetwork() {
    const { activeAccountID, activeNetworkID } = this;
    return { activeAccountID, activeNetworkID };
  }

  @Watch("accountAndNetwork")
  async onChangeAccount() {
    if (this.isStoreRestored) {
      const account = this.getAccountById(this.activeAccountID);
      await this.updateBalance(account!.id);
    }
  }

  async airdrop() {
    try {
      this.isAirdropPending = true;
      await sendGrams(tonService.client, {
        dest: this.account!.address,
        amount: "10000000000",
      });
      this.isAirdropPending = false;
    } catch (error) {
      this.isAirdropPending = false;
      console.error(error);
      throw new Error(error);
    }
  }

  transfer() {
    if (this.account!.tokens[0].isDeployed) {
      this.$router.push("/transfer");
    } else {
      this.isDeployModalOpen = true;
    }
  }
  async updateBalance(id: number) {
    await this.updateBalanceById({
      id,
      tokenId: 0,
      client: tonService.client,
    });
  }

  async created() {
    // @ts-ignore
    store.restored.then(async () => {
      const account = this.getAccountById(this.activeAccountID);
      await this.updateBalance(account!.id);
    });
  }
}
</script>





<style lang="sass">
.v-main-page
  &__menu-bar
    display: grid
    grid-template-columns: 30% minmax(30%, 1fr) 30%
    -webkit-column-gap: 5px
    -moz-column-gap: 5px
    column-gap: 5px
    padding: 0 8px
    border-bottom: 1px solid #d6d9dc
    height: 64px
    &-selected-account
      grid-column: 2/span 1
      place-self: center stretch
    &-dots
      place-self: center end
</style>