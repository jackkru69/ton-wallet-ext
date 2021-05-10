<template>
  <div class="v-main-page">
    <DeployModal ref="deployModal" />
    <AccountDetailsModal
      v-model="isAccountDetailsModalOpen"
      :account="account"
    />
    <InsufficientFundsModal v-model="isInsufficientFundsModalOpen" />
    <Inner>
      <div class="d-flex align-center justify-space-between mb-5">
        <h1>
          Account
          <VBtn
            v-if="activeNetworkServer === 'http://0.0.0.0'"
            x-small
            :loading="isAirdropPending"
            @click="airdrop"
            icon
            ><VIcon>mdi-water</VIcon></VBtn
          >
        </h1>
        <VMenu left nudge-bottom="6" offset-y light>
          <template v-slot:activator="{ attrs, on }">
            <VBtn
              x-small
              v-bind="attrs"
              v-on="on"
              color="primary"
              min-width="30"
              :style="{ padding: 0 }"
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
      <VCard light class="mb-5">
        <v-img
          class="pa-4"
          position="top right"
          height="110px"
          width="100%"
          contain
          src="@/assets/img/balance-card-background.svg"
        >
          <h2>{{ account && account.name ? account.name : "" }}</h2>
          <h1>{{ baseToAssetAmount(balance, "TON", 3) + " " + "TON" }}</h1>
          <VTooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <VBtn
                :style="{ padding: 0 }"
                x-small
                plain
                v-clipboard="() => account && account.address"
                v-bind="attrs"
                v-on="on"
                rounded
              >
                <template v-slot:default>
                  <div>
                    {{
                      account && account.address
                        ? sliceString(account.address, 6)
                        : ""
                    }}
                  </div>
                </template>
              </VBtn>
            </template>
            <span>Copy to clipboard</span>
          </VTooltip>
        </v-img>
      </VCard>
      <div class="v-main-page__buttons-row mb-5">
        <VBtn x-small @click="action('transfer')" color="primary"
          >Send transaction</VBtn
        >
        <VBtn color="primary" x-small @click="action('propose')"
          >Propose transaction</VBtn
        >
        <VBtn color="primary" x-small @click="action('confirm')"
          >Confirm transaction</VBtn
        >
      </div>

      <h1 class="mb-4">Transactions</h1>

      <VDataTable
        :loading="isTxsPendins"
        :items="formattedTxs"
        :items-per-page="5"
        hide-default-footer
        hide-default-header
        mobile-breakpoint="0"
        class="v-main-page__table"
      >
        <template v-slot:[`item`]="{ item }">
          <tr>
            <td width="32px" :style="{ 'padding-right': '16px !important' }">
              <VBtn
                v-if="item.type === 'plus'"
                x-small
                light
                min-width="30"
                :style="{ padding: 0 }"
              >
                <VIcon>mdi-plus-thick</VIcon>
              </VBtn>
              <VBtn
                v-if="item.type === 'minus'"
                x-small
                light
                min-width="30"
                :style="{ padding: 0 }"
              >
                <VIcon>mdi-minus-thick</VIcon>
              </VBtn>
            </td>
            <td>
              <div class="v-main-page__table-amount">
                {{ item.fValue + " TON" }}
              </div>
              <VTooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <a
                    v-bind="attrs"
                    v-on="on"
                    target="_blank"
                    :href="txExplorerLink(item.id)"
                    class="v-main-page__table-tx-id"
                  >
                    {{ item.fId }}
                  </a>
                </template>
                <span>Explorer link</span>
              </VTooltip>
            </td>
            <td>
              <div class="v-main-page__table-flex-col">
                <TimeAgo long refresh :datetime="item.now * 1000"></TimeAgo>
              </div>
            </td>
          </tr> </template
      ></VDataTable>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import DeployModal from "@/components/modals/DeployModal.vue";
// @ts-ignore
import { TimeAgo } from "vue2-timeago";

import {
  AccountInterface,
  accountsModuleMapper,
} from "@/store/modules/accounts";

import { walletModuleMapper } from "@/store/modules/wallet";
import { baseToAssetAmount, sliceString } from "@/utils";
import {
  formatTx,
  getAccountTxs,
  getAccountExplorerLink,
  sendGrams,
  getTxExplorerLink,
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
    getAccountExplorerLink,
    getTxExplorerLink,
  },
});

@Component({
  components: {
    Inner,
    DeployModal,
    AccountDetailsModal,
    InsufficientFundsModal,
    TimeAgo,
  },
  methods: { sliceString, baseToAssetAmount },
})
export default class MainPage extends Mappers {
  isMounted = false;

  isAirdropPending = false;
  isTxsPendins = true;

  isAccountDetailsModalOpen = false;
  isInsufficientFundsModalOpen = false;

  @Inject() showTypePasswordModal!: any;

  txs: TxType[] = [];

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
        return this.getAccountExplorerLink(
          network.explorer,
          this.activeAccountAddress
        );
      }
    }
    return "";
  }

  txExplorerLink(txId: string) {
    if (this.activeAccountAddress) {
      const network = this.getNetworkByServer(this.activeNetworkServer);
      if (network) {
        return this.getTxExplorerLink(network.explorer, txId);
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

  action(action: string) {
    if (this.account) {
      const isBalanceGreaterThanZero = new BigNumber(
        this.balance
      ).isGreaterThan(0);
      if (isBalanceGreaterThanZero) {
        if (this.account.networks.includes(this.activeNetworkServer)) {
          if (action === "propose") {
            this.$router.push("/propose-transaction");
          }
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
  padding-bottom: 30px
  &__buttons-row
    display: flex
    flex-direction: column
    button:not(:last-child)
      margin-bottom: 8px

    @media screen and (min-width: 500px)
      flex-direction: row
      justify-content: space-between
      button
        width: calc( 33% - 10px )
      button:not(:last-child)
        margin-bottom: 0

  &__table
    background-color: #303540 !important
    tr
      &:hover
        background-color: #303540 !important
      td
        padding: 0 !important
        border-bottom: none !important
    &-flex-col
      display: flex
      flex-direction: column
      align-items: flex-end
    &-amount
      font-weight: 600
      font-size: 15px
      line-height: 20px
    &-tx-id
      font-weight: 300
      font-size: 10px
      line-height: 14px
      text-decoration: none
      color: white !important
      transition: all 0.3 ease-out
      &:hover
        font-weight: 400
</style>