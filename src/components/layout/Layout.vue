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
import { subscribeAndUpdateAccount } from "@/ton/ton.utils";

const Mappers = Vue.extend({
  methods: {
    ...accountsModuleMapper.mapActions([
      "updateBalanceById",
      "setBalanceByIdAndTokenId",
    ]),
  },
  computed: {
    ...rootModuleMapper.mapGetters([
      "activeAccountID",
      "activeNetworkID",
      "isStoreRestored",
    ]),
    ...accountsModuleMapper.mapGetters(["getAccountById"]),
  },
});

@Component({
  components: { Aside, Header },
})
export default class Layout extends Mappers {
  handleId: number;

  public get accountAndNetwork() {
    const { activeAccountID, activeNetworkID } = this;
    return { activeAccountID, activeNetworkID };
  }

  @Watch("accountAndNetwork")
  async onChangeAccount(val: {
    activeAccountID: number;
    activeNetworkID: number;
  }) {
    if (this.isStoreRestored) {
      if (this.handleId) {
        await tonService.client.net.unsubscribe({ handle: this.handleId });
      }

      const account = this.getAccountById(val.activeAccountID);
      const response = await subscribeAndUpdateAccount(
        tonService.client,
        account!.address,
        (params) => {
          console.log(params);
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
      this.handleId = response.handle;
    }
  }

  async created() {
    // @ts-ignore
    store.restored.then(async () => {
      const account = this.getAccountById(this.activeAccountID);
      const response = await subscribeAndUpdateAccount(
        tonService.client,
        account!.address,
        (params) => {
          console.log(params);
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
      this.handleId = response.handle;
    });
  }

  async destroyed() {
    if (this.handleId) {
      await tonService.client.net.unsubscribe({ handle: this.handleId });
    }
  }
}
</script>

