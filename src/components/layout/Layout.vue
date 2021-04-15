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
import { rootModuleMapper } from "@/store/root";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { store } from "@/store";
import { subscribeAccount } from "@/ton/ton.utils";

const Mappers = Vue.extend({
  methods: {
    ...accountsModuleMapper.mapActions([
      "updateBalanceById",
      "setBalanceByIdAndTokenId",
    ]),
    ...rootModuleMapper.mapMutations(["setSubscriptionBalanceHandle"]),
  },
  computed: {
    ...rootModuleMapper.mapGetters([
      "activeAccountID",
      "activeNetworkID",
      "isStoreRestored",
      "subscriptionBalanceHandle",
    ]),
    ...accountsModuleMapper.mapGetters(["getAccountById"]),
  },
});

@Component({
  components: { Aside, Header },
})
export default class Layout extends Mappers {
  public get accountAndNetwork() {
    const { activeAccountID, activeNetworkID } = this;
    return { activeAccountID, activeNetworkID };
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
    activeAccountID: number;
    activeNetworkID: number;
  }) {
    if (this.isStoreRestored) {
      const account = this.getAccountById(val.activeAccountID);
      const response = await subscribeAccount(
        tonService.client,
        account!.address,
        (params) => {
          if (params.result.balance) {
            this.setBalanceByIdAndTokenId({
              id: this.activeAccountID,
              tokenId: 0,
              client: tonService.client,
              newBalance: params.result.balance,
            });
          }
        }
      );
      this.setSubscriptionBalanceHandle(response.handle);
    }
  }

  @Watch("accountAndNetwork")
  async onChangeAccount2(val: {
    activeAccountID: number;
    activeNetworkID: number;
  }) {
    // if (this.isStoreRestored) {
    // }
  }

  async mounted() {
    // @ts-ignore
    store.restored.then(async () => {
      const account = this.getAccountById(this.activeAccountID);
      const response = await subscribeAccount(
        tonService.client,
        account!.address,
        (params) => {
          if (params.result.balance) {
            this.setBalanceByIdAndTokenId({
              id: this.activeAccountID,
              tokenId: 0,
              client: tonService.client,
              newBalance: params.result.balance,
            });
          }
        }
      );
      this.setSubscriptionBalanceHandle(response.handle);
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
}
</script>

