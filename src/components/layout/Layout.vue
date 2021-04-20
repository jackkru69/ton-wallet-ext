<template>
  <v-app>
    <Header />
    <v-main>
      <v-container fluid class="pa-0">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Aside from "@/components/layout/Aside.vue";
import Header from "@/components/layout/Header.vue";
import { tonService } from "@/background";
import { walletModuleMapper } from "@/store/modules/wallet";
import { accountsModuleMapper, contracts } from "@/store/modules/accounts";
import { store } from "@/store";
import {
  checkDeployStatus,
  getAccountTxs,
  subscribeAccount,
} from "@/ton/ton.utils";
import TonContract from "@/ton/ton.contract";

const Mappers = Vue.extend({
  methods: {
    ...accountsModuleMapper.mapActions([
      "updateBalanceByAddress",
      "setBalanceByAddressAndTokenSymbol",
    ]),
    ...walletModuleMapper.mapMutations(["setSubscriptionBalanceHandle"]),
    ...accountsModuleMapper.mapMutations([
      "setTransactions",
      "deleteAccount",
      "setPendingTransactions",
    ]),
  },
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkID",
      "isStoreRestored",
      "subscriptionBalanceHandle",
    ]),
    ...accountsModuleMapper.mapGetters(["getAccountByAddress"]),
  },
});

@Component({
  components: { Aside, Header },
})
export default class Layout extends Mappers {
  public get accountAndNetwork() {
    const { activeAccountAddress, activeNetworkID } = this;
    return { activeAccountAddress, activeNetworkID };
  }

  @Watch("subscriptionBalanceHandle")
  async close(v: any, oldV: any) {
    if (oldV) {
      await tonService.client.net.unsubscribe({
        handle: oldV,
      });
    }
  }

  @Watch("accountAndNetwork")
  async onChangeAccount(val: {
    activeAccountAddress: string | undefined;
    activeNetworkID: number;
  }) {
    if (this.isStoreRestored) {
      const account = this.getAccountByAddress(val.activeAccountAddress);
      if (account) {
        const isExist = await checkDeployStatus(
          tonService.client,
          account.address,
          [0, 1, 2]
        );
        if (isExist) {
          const contract = new TonContract({
            client: tonService.client,
            tonPackage: contracts[account.walletType],
            name: account.walletType,
            address: account.address,
          });
          const responseTx = await contract.run({
            functionName: "getTransactions",
          });
          this.setPendingTransactions({
            address: this.activeAccountAddress,
            symbol: "TON",
            pendingTransactions: responseTx.value.transactions,
          });
          await this.updateBalance(account.address);
          const responseTxs = await getAccountTxs(
            tonService.client,
            account.address
          );
          this.setTransactions({
            address: account.address,
            symbol: "TON",
            transactions: responseTxs,
          });
          const responseAcc = await subscribeAccount(
            tonService.client,
            account.address,
            (params) => {
              if (params.result.balance) {
                this.setBalanceByAddressAndTokenSymbol({
                  address: account.address,
                  symbol: "TON",
                  newBalance: params.result.balance,
                });
              }
            }
          );
          this.setSubscriptionBalanceHandle(responseAcc.handle);
        }
      }
    }
  }

  async mounted() {
    // @ts-ignore
    store.restored.then(async () => {
      if (this.activeAccountAddress) {
        const isExist = await checkDeployStatus(
          tonService.client,
          this.activeAccountAddress,
          [0, 1, 2]
        );
        if (isExist) {
          await this.updateBalance(this.activeAccountAddress);
          const responseTxs = await getAccountTxs(
            tonService.client,
            this.activeAccountAddress
          );
          this.setTransactions({
            address: this.activeAccountAddress,
            symbol: "TON",
            transactions: responseTxs,
          });
          const response = await subscribeAccount(
            tonService.client,
            this.activeAccountAddress,
            (params) => {
              if (params.result.balance) {
                this.setBalanceByAddressAndTokenSymbol({
                  address: this.activeAccountAddress,
                  symbol: "TON",
                  newBalance: params.result.balance,
                });
              }
            }
          );
          this.setSubscriptionBalanceHandle(response.handle);
        }
      }
    });
  }

  async beforeDestroy() {
    if (this.subscriptionBalanceHandle) {
      await tonService.client.net.unsubscribe({
        handle: this.subscriptionBalanceHandle,
      });
      this.setSubscriptionBalanceHandle(null);
    }
  }

  async updateBalance(address: string | undefined) {
    await this.updateBalanceByAddress({
      address,
      symbol: "TON",
      client: tonService.client,
    });
  }
}
</script>

