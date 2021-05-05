<template>
  <div class="v-main-page">
    <DeployModal ref="deployModal" />
    <CustodiansModal
      v-model="isCustodiansModalOpen"
      :custodians="account ? account.custodians : []"
    />
    <AccountDetailsModal
      v-model="isAccountDetailsModalOpen"
      :account="account"
    />
    <InsufficientFundsModal v-model="isInsufficientFundsModalOpen" />
    <Inner>
      <div class="v-main-page__menu-bar">
        <VTooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <VBtn
              x-small
              plain
              v-clipboard="() => account && account.address"
              class="v-main-page__menu-bar-selected-account"
              v-bind="attrs"
              v-on="on"
              rounded
            >
              <template v-slot:default>
                <div>
                  <div>{{ account && account.name ? account.name : "" }}</div>
                  <div>
                    {{
                      account && account.address
                        ? sliceString(account.address)
                        : ""
                    }}
                  </div>
                </div>
              </template>
            </VBtn>
          </template>
          <span>Copy to clipboard</span>
        </VTooltip>
        <VMenu left nudge-bottom="6" offset-y :light="true">
          <template v-slot:activator="{ attrs, on }">
            <VBtn
              x-small
              icon
              v-bind="attrs"
              v-on="on"
              class="v-main-page__menu-bar-dots"
            >
              <VIcon>mdi-dots-vertical</VIcon>
            </VBtn>
          </template>
          <VList nav>
            <VListItem @click="isAccountDetailsModalOpen = true">
              <VListItemTitle>account details</VListItemTitle>
            </VListItem>
            <VListItem
              v-if="activeNetworkServer !== 'http://0.0.0.0'"
              link
              :href="explorerLink"
              target="_blank"
            >
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
          {{ baseToAssetAmount(balance, "TON", 3) + " " + "TON" }}
        </h1>
      </div>
      <div class="d-flex justify-center my-4">
        <h3 role="button" aria-pressed="" @click="isCustodiansModalOpen = true">
          Custodians {{ account && account.custodians.length }}
        </h3>
      </div>
      <div class="d-flex justify-center align center">
        <VBtn
          x-small
          v-if="activeNetworkServer === 'http://0.0.0.0'"
          :loading="isAirdropPending"
          @click="airdrop"
          class="mr-4"
          icon
          ><VIcon>mdi-water</VIcon></VBtn
        >
        <VTooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <VBtn
              x-small
              class="mr-4"
              @click="transferOrConfirm('confirm')"
              v-on="on"
              v-bind="attrs"
              icon
              ><VIcon :width="40">mdi-draw</VIcon></VBtn
            >
          </template>
          <span>Confirm transaction</span>
        </VTooltip>
        <VTooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <VBtn
              x-small
              @click="transferOrConfirm('transfer')"
              v-on="on"
              v-bind="attrs"
              icon
              ><VIcon :width="40">mdi-send</VIcon></VBtn
            >
          </template>
          <span>Create transfer</span>
        </VTooltip>
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
            :loading="isTxsPendins"
            :headers="headersTxs"
            :items="formattedTxs"
            :items-per-page="5"
          >
            <template v-slot:[`item.type`]="{ item }">
              <VChip w :color="item.type === 'minus' ? 'red' : 'green'">
                {{ item.type === "plus" ? "IN" : "OUT" }}
              </VChip>
            </template></VDataTable
          >
        </VTabItem>
        <!-- <VTabItem key="tokens">
          <VDataTable :headers="[]" :items="[]" :items-per-page="5">
          </VDataTable>
        </VTabItem> -->
      </VTabsItems>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import DeployModal from "@/components/modals/DeployModal.vue";
import CustodiansModal from "@/components/modals/CustodiansModal.vue";

import {
  AccountInterface,
  accountsModuleMapper,
} from "@/store/modules/accounts";

import { walletModuleMapper } from "@/store/modules/wallet";
import { baseToAssetAmount, sliceString } from "@/utils";
import {
  formatTx,
  getAccountTxs,
  getExplorerLink,
  sendGrams,
} from "@/ton/ton.utils";
import { tonService } from "@/background";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import AccountDetailsModal from "@/components/modals/AccountDetailsModal.vue";
import InsufficientFundsModal from "@/components/modals/InsufficientFundsModal.vue";
import BigNumber from "bignumber.js";
import { TxType } from "@/types/transactions";
import { networksModuleMapper } from "@/store/modules/networks";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkServer",
      "isStoreRestored",
    ]),
    ...accountsModuleMapper.mapGetters([
      "getAccountByAddress",
      "accountsCount",
      "accounts",
      "getTokenBySymbol",
    ]),
    ...networksModuleMapper.mapGetters(["getNetworkByServer"]),
    ...keystoreModuleMapper.mapGetters(["getPublicKeyData"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["updateBalanceByAddress"]),
    ...accountsModuleMapper.mapMutations(["deleteAccount"]),
    ...walletModuleMapper.mapMutations(["setActiveAccountAddress"]),
    ...keystoreModuleMapper.mapActions(["removeKey"]),
    getExplorerLink,
  },
});

@Component({
  components: {
    Inner,
    DeployModal,
    CustodiansModal,
    AccountDetailsModal,
    InsufficientFundsModal,
  },
  methods: { sliceString, baseToAssetAmount },
})
export default class MainPage extends Mappers {
  isMounted = false;

  isAirdropPending = false;
  isTxsPendins = true;

  isCustodiansModalOpen = false;
  isAccountDetailsModalOpen = false;
  isInsufficientFundsModalOpen = false;

  @Inject() showTypePasswordModal!: any;

  txs: TxType[] = [];

  tab = "txs";

  items = [
    {
      title: "Transactions",
      tab: "txs",
    },
    // { title: "Tokens", tab: "tokens" },
  ];

  headersTxs = [
    {
      text: "",
      value: "type",
      sortable: false,
    },
    {
      text: "ID",
      value: "fId",
      sortable: false,
    },
    {
      text: "Address",
      value: "address",
      sortable: false,
    },
    {
      text: "Amount",
      value: "fValue",
      sortable: false,
    },
    {
      text: "Comment",
      value: "comment",
      sortable: false,
    },
  ];

  public get account(): AccountInterface | undefined {
    return this.getAccountByAddress(this.activeAccountAddress);
  }

  public get formattedTxs(): any[] {
    return this.txs.map(formatTx);
  }

  public get accountAndNetwork() {
    const { activeAccountAddress, activeNetworkServer } = this;
    return { activeAccountAddress, activeNetworkServer };
  }

  async fetchTxs() {
    if (this.activeAccountAddress) {
      try {
        this.isTxsPendins = true;
        const response = await getAccountTxs(
          tonService.client,
          this.activeAccountAddress
        );
        this.txs = response;
        this.isTxsPendins = false;
      } catch (error) {
        this.isTxsPendins = false;
      }
    }
  }
  @Watch("accountAndNetwork")
  async onChangeFields() {
    if (this.isMounted) {
      this.fetchTxs();
    }
  }

  public get explorerLink(): string {
    if (this.activeAccountAddress) {
      const network = this.getNetworkByServer(this.activeNetworkServer);
      if (network) {
        const link = this.getExplorerLink(
          network.explorer,
          this.activeAccountAddress
        );
        return link;
      }
    }
    return "";
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

  transferOrConfirm(action: string) {
    if (this.account) {
      const isBalanceGreaterThanZero = new BigNumber(
        this.balance
      ).isGreaterThan(0);
      if (isBalanceGreaterThanZero) {
        if (this.account.networks.includes(this.activeNetworkServer)) {
          if (action === "confirm") {
            this.$router.push("/confirm-transaction");
          }
          if (action === "transfer") {
            this.$router.push("/transfer");
          }
        } else {
          this.showTypePasswordModal(this.activeAccountAddress).then(
            async (result: any) => {
              const deployModal: any = this.$refs.deployModal;
              await deployModal.onClickDeploy(result);
            }
          );
        }
      } else {
        this.isInsufficientFundsModalOpen = true;
      }
    }
  }

  onClickDeleteAccount() {
    if (this.accountsCount <= 1) {
      if (this.activeAccountAddress) {
        this.deleteAccount(this.activeAccountAddress);
        this.removeKey(this.activeAccountAddress);
        this.setActiveAccountAddress(undefined);
        this.$router.push("/initialize");
      }
    } else {
      if (this.activeAccountAddress) {
        this.deleteAccount(this.activeAccountAddress);
        this.removeKey(this.activeAccountAddress);
        const address = this.accounts[0].address;
        if (address) this.setActiveAccountAddress(address);
      }
    }
  }

  public get balance(): string {
    if (this.activeAccountAddress) {
      const token = this.getTokenBySymbol(this.activeAccountAddress, "TON");
      if (token) {
        return token.balance;
      }
    }
    return "";
  }

  @Watch("balance")
  onChangeBalance() {
    this.fetchTxs();
  }

  async mounted() {
    this.fetchTxs();
    this.isMounted = true;
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