<template>
  <div class="v-main-page">
    <DeployModal v-model="isDeployModalOpen" />
    <CustodiansModal
      v-model="isCustodiansModalOpen"
      :custodians="account ? account.custodians : []"
    />
    <Inner>
      <div class="v-main-page__menu-bar">
        <VTooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <VBtn
              plain
              v-clipboard="() => account && account.address"
              class="v-main-page__menu-bar-selected-account"
              v-bind="attrs"
              v-on="on"
              rounded
            >
              <template v-slot:default>
                <div>
                  <div>{{ account && account.name }}</div>
                  <div>{{ account && sliceString(account.address) }}</div>
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
            <VListItem @click="onClickDeleteAccount">
              <VListItemTitle>delete</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </div>
      <v-divider></v-divider>
      <div class="d-flex justify-center my-4">
        <h1>
          {{
            account &&
            account.tokens.length &&
            baseToAssetAmount(account.tokens[0].balance, "TON") +
              " " +
              account.tokens[0].symbol
          }}
        </h1>
      </div>
      <div class="d-flex justify-center my-4">
        <h3 role="button" aria-pressed="" @click="isCustodiansModalOpen = true">
          Custodians {{ account && account.custodians.length }}
        </h3>
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

      <VTabs grow v-model="tab" class="my-8">
        <VTabsSlider></VTabsSlider>
        <VTab v-for="item in items" :key="item.tab" value="ptxs">
          {{ item.title }}
        </VTab>
      </VTabs>
      <VTabsItems v-model="tab">
        <VTabItem key="txs">
          <VDataTable
            :headers="headersTxs"
            :items="txs"
            :items-per-page="5"
          ></VDataTable>
        </VTabItem>
        <VTabItem key="tokens">
          <VDataTable
            :headers="[]"
            :items="[]"
            :items-per-page="5"
          ></VDataTable>
        </VTabItem>
      </VTabsItems>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import DeployModal from "@/components/modals/DeployModal.vue";
import CustodiansModal from "@/components/modals/CustodiansModal.vue";

import { VCard } from "vuetify/lib";
import {
  AccountInterface,
  accountsModuleMapper,
} from "@/store/modules/accounts";

import { walletModuleMapper } from "@/store/modules/wallet";
import { baseToAssetAmount, sliceString } from "@/utils";
import { sendGrams } from "@/ton/ton.utils";
import { tonService } from "@/background";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkID",
      "isStoreRestored",
    ]),
    ...accountsModuleMapper.mapGetters([
      "getAccountByAddress",
      "getFormattedTxsByAddress",
      "getFormattedPendingTxsByAddress",
      "accountsCount",
      "accounts",
    ]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["updateBalanceByAddress"]),
    ...accountsModuleMapper.mapMutations([
      "setTransactions",
      "deleteAccount",
      "setPendingTransactions",
    ]),
    ...walletModuleMapper.mapMutations(["setActiveAccountAddress"]),
  },
});

@Component({
  components: { Inner, VCard, DeployModal, CustodiansModal },
  methods: { sliceString, baseToAssetAmount },
})
export default class MainPage extends Mappers {
  isAirdropPending = false;
  isDeployModalOpen = false;
  isCustodiansModalOpen = false;

  tab = "txs";

  items = [
    {
      title: "Transactions",
      tab: "txs",
    },
    { title: "Tokens", tab: "tokens" },
  ];

  headersTxs = [
    {
      text: "id",
      value: "fId",
    },
    {
      text: "src",
      value: "fSrc",
    },
    {
      text: "dst",
      value: "fDst",
    },
    {
      text: "value",
      value: "fValue",
    },
  ];

  public get account(): AccountInterface | undefined {
    return this.getAccountByAddress(this.activeAccountAddress);
  }

  public get txs(): any[] | undefined {
    return this.getFormattedTxsByAddress(this.activeAccountAddress, "TON");
  }

  public get pendingTxs(): any[] | undefined {
    return this.getFormattedPendingTxsByAddress(
      this.activeAccountAddress,
      "TON"
    );
  }

  public get accountAndNetwork() {
    const { activeAccountAddress, activeNetworkID } = this;
    return { activeAccountAddress, activeNetworkID };
  }

  async airdrop() {
    if (this.account) {
      try {
        this.isAirdropPending = true;
        await sendGrams(tonService.client, {
          dest: this.account.address,
          amount: "10000000000",
        });
        this.isAirdropPending = false;
      } catch (error) {
        this.isAirdropPending = false;
        console.error(error);
        throw new Error(error);
      }
    }
  }

  transfer() {
    if (this.account) {
      if (this.account.networks.includes(this.activeNetworkID)) {
        this.$router.push("/transfer");
      } else {
        this.isDeployModalOpen = true;
      }
    }
  }

  onClickDeleteAccount() {
    if (this.accountsCount <= 1) {
      this.deleteAccount(this.activeAccountAddress);
      this.$router.push("/initialize");
    } else {
      this.deleteAccount(this.activeAccountAddress);
      const address = this.accounts[0].address;
      if (address) this.setActiveAccountAddress(address);
    }
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