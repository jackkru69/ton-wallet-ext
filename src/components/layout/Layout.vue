<template>
  <v-app>
    <TypePasswordModal
      v-model="password"
      :isOpen="isTypePasswordModalOpen"
      :resolvePromise="resolvePromise"
      :rejectPromise="rejectPromise"
      :passwordErrors="passwordErrors"
    />
    <Header />
    <v-main>
      <v-container fluid class="pa-0">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Provide, Vue, Watch } from "vue-property-decorator";
import Header from "@/components/layout/Header.vue";
import { tonService } from "@/background";
import { walletModuleMapper } from "@/store/modules/wallet";
import TypePasswordModal from "@/components/modals/TypePasswordModal.vue";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { store } from "@/store";
import { checkDeployStatus } from "@/ton/ton.utils";
import { keystoreModuleMapper } from "@/store/modules/keystore";

import "@/styles/font.sass";

const Mappers = Vue.extend({
  methods: {
    ...accountsModuleMapper.mapActions(["updateBalanceByAddress"]),
    ...accountsModuleMapper.mapMutations([
      "updateBalanceByAddressMut",
      "addNetworkToAccount",
    ]),
  },
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkServer",
    ]),
    ...accountsModuleMapper.mapGetters(["getAccountByAddress"]),
    ...keystoreModuleMapper.mapGetters([
      "getKeyIDs",
      "getPrivateData",
      "getPublicKeyData",
    ]),
  },
});

@Component({
  components: { Header, TypePasswordModal },
})
export default class Layout extends Mappers {
  timeoutID: NodeJS.Timeout;
  isAccountOrNetworkChanged = false;

  isMounted = false;

  isTypePasswordModalOpen = false;

  resolvePromise: any = null;
  rejectPromise: any = null;

  password = "";
  passwordErrors: string[] = [];

  @Provide() showTypePasswordModal = this._showTypePasswordModal;

  public get accountAndNetwork() {
    const { activeAccountAddress, activeNetworkServer } = this;
    return { activeAccountAddress, activeNetworkServer };
  }

  public get isDeployed(): boolean {
    const account = this.getAccountByAddress(this.activeAccountAddress);
    if (account) {
      return account.networks.includes(this.activeNetworkServer);
    }
    return false;
  }

  @Watch("accountAndNetwork")
  async onChangeAccount(val: {
    activeAccountAddress: string | undefined;
    activeNetworkServer: number;
  }) {
    if (this.isMounted) {
      if (val.activeAccountAddress && tonService.client.net) {
        const isExist = await checkDeployStatus(
          tonService.client,
          val.activeAccountAddress,
          [0, 1, 2]
        );

        if (isExist) {
          await this.updateBalance(this.activeAccountAddress);
          clearTimeout(this.timeoutID);
          this.timeoutID = setInterval(async () => {
            await this.updateBalance(this.activeAccountAddress);
          }, 8000);
        } else {
          this.updateBalanceByAddressMut({
            address: val.activeAccountAddress,
            symbol: "TON",
            newBalance: "0",
          });
        }
      }
    }
  }

  @Watch("activeNetworkServer")
  async onChangeNetwork() {
    if (this.activeAccountAddress) {
      if (!this.isDeployed) {
        const isUnInit = await checkDeployStatus(
          tonService.client,
          this.activeAccountAddress,
          [0]
        );
        if (isUnInit === false) {
          this.addNetworkToAccount({
            address: this.activeAccountAddress,
            networkServer: this.activeNetworkServer,
          });
        }
      }
    }
  }

  async mounted() {
    // @ts-ignore
    store.restored.then(async () => {
      this.isMounted = true;
      if (this.activeAccountAddress && tonService.client.net) {
        const isExist = await checkDeployStatus(
          tonService.client,
          this.activeAccountAddress,
          [0, 1, 2]
        );
        if (isExist) {
          this.timeoutID = setInterval(async () => {
            await this.updateBalance(this.activeAccountAddress);
          }, 3000);
        } else {
          this.updateBalanceByAddressMut({
            address: this.activeAccountAddress,
            symbol: "TON",
            newBalance: "0",
          });
        }
      }
    });
  }

  beforeUnmount() {
    clearTimeout(this.timeoutID);
  }

  async updateBalance(address: string | undefined) {
    if (address)
      await this.updateBalanceByAddress({
        address,
        symbol: "TON",
        client: tonService.client,
      });
  }

  @Watch("password")
  onChangePassword() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
  }

  _showTypePasswordModal(address?: string) {
    return new Promise((resolve, reject) => {
      this.isTypePasswordModalOpen = true;

      this.resolvePromise = () => {
        try {
          if (address) {
            const privateData = this.getPrivateData(address, this.password);
            const keypair = {
              public: this.getPublicKeyData(address),
              secret: privateData.secret,
            };
            resolve({
              password: this.password,
              keypair,
              seedPhrase: privateData.seedPhrase,
            });
          } else {
            this.getPrivateData(this.getKeyIDs[0], this.password);
            resolve({ password: this.password });
          }
          this.password = "";
          this.isTypePasswordModalOpen = false;
        } catch (error) {
          this.passwordErrors = ["Invalid password"];
        }
      };

      this.rejectPromise = () => {
        reject(false);
        this.isTypePasswordModalOpen = false;
      };
    });
  }
}
</script>

