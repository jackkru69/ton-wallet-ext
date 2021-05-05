<template>
  <v-app-bar :height="90" class="v-app-bar" app flat>
    <Inner>
      <div class="d-flex align-center" :style="{ height: '100%' }">
        <RouterLink to="/">
          <img class="v-app-bar__logo" src="@/assets/img/logo.svg" alt="logo" />
        </RouterLink>
        <VSpacer />
        <VSelect
          :items="networksForSelect"
          v-model="modelNetwork"
          item-text="title"
          item-value="value"
          hide-details
          dense
          outlined
          class="v-app-bar__select"
          background-color="#FFFFFF"
          :light="true"
          :menu-props="{ light: true, 'offset-y': true }"
        />
        <VMenu
          bottom
          max-width="320px"
          min-width="320px"
          max-height="526px"
          rounded
          left
          offset-y
          nudge-bottom="10"
          v-if="accountsCount !== 0"
        >
          <template v-slot:activator="{ on }">
            <VBtn x-small class="ml-5" icon v-on="on">
              <VAvatar color="white" size="40"> </VAvatar>
            </VBtn>
          </template>
          <VCard :light="true">
            <template v-if="!isEmpty(accounts)">
              <v-subheader>Accounts</v-subheader>
              <v-divider></v-divider>
              <VList class="v-app-bar__list" max-height="228px">
                <VListItemGroup
                  @change="onChange"
                  v-model="modelActiveAccountAddress"
                  color="primary"
                >
                  <VListItem
                    v-for="item in accounts"
                    :key="item.address"
                    :value="item.address"
                    :disabled="item.address === activeAccountAddress"
                  >
                    <VListItemContent>
                      <VListItemTitle v-text="item.name"></VListItemTitle>
                    </VListItemContent>
                  </VListItem>
                </VListItemGroup>
              </VList>
              <v-divider></v-divider>
            </template>

            <VList nav>
              <VListItem @click="onClickEasyAdd">
                <VListItemContent>
                  <VListItemTitle>Easy add account</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem link to="/initialize/create">
                <VListItemContent>
                  <VListItemTitle>Add account</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem link to="/initialize/restore">
                <VListItemContent>
                  <VListItemTitle>Restore account</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem link to="/change-password">
                <VListItemContent>
                  <VListItemTitle>Change password</VListItemTitle>
                </VListItemContent>
              </VListItem>
              <VListItem @click="onClickResetWallet">
                <VListItemContent>
                  <VListItemTitle>Reset wallet</VListItemTitle>
                </VListItemContent>
              </VListItem>
            </VList>
          </VCard>
        </VMenu>
      </div>
    </Inner>
  </v-app-bar>
</template>


  <script lang="ts">
import { tonService } from "@/background";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { networksModuleMapper } from "@/store/modules/networks";

import { walletModuleMapper } from "@/store/modules/wallet";
import { convertSeedToKeyPair, generateSeed } from "@/ton/ton.utils";

import { isEmpty } from "lodash";
import { Component, Inject, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";

const Mappers = Vue.extend({
  methods: {
    ...walletModuleMapper.mapMutations([
      "setNetwork",
      "setActiveAccountAddress",
    ]),
    ...accountsModuleMapper.mapMutations([
      "deleteAccount",
      "deleteAllAccounts",
    ]),
    ...accountsModuleMapper.mapActions(["addAccount"]),
    ...keystoreModuleMapper.mapMutations(["removeKey", "removeAllKey"]),
    isEmpty,
  },
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeNetworkServer",
      "activeAccountAddress",
      "isStoreRestored",
    ]),
    ...accountsModuleMapper.mapGetters(["accounts", "accountsCount"]),
    ...networksModuleMapper.mapGetters(["networksForSelect"]),
    modelNetwork: {
      get() {
        return this.activeNetworkServer;
      },
      set(value: string) {
        this.setNetwork(value);
      },
    },
    modelActiveAccountAddress: {
      get() {
        return this.activeAccountAddress;
      },
      set(value: string) {
        this.setActiveAccountAddress(value);
      },
    },
  },
});

@Component({ components: { Inner } })
export default class Header extends Mappers {
  onChange() {
    if (this.$route.path !== "/") {
      this.$router.push("/");
    }
  }

  @Inject() showTypePasswordModal!: any;

  onClickEasyAdd() {
    this.showTypePasswordModal().then(async (result: any) => {
      const seedPhrase: any = await generateSeed(tonService.client, 12);
      const keypair = await convertSeedToKeyPair(
        tonService.client,
        seedPhrase?.phrase,
        12
      );
      const { activeNetworkServer, accountsCount } = this;
      await this.addAccount({
        keypair,
        custodians: [`0x${keypair.public}`],
        walletType: "safe-multisig",
        networkServer: activeNetworkServer,
        name: `Account ${accountsCount + 1}`,
        client: tonService.client,
        password: result.password,
        seedPhrase: seedPhrase?.phrase,
        isRestoredWithKeyPair: false,
      });
      if (this.$route.path !== "/") this.$router.push("/");
    });
  }

  onClickResetWallet() {
    this.showTypePasswordModal().then(() => {
      this.deleteAllAccounts();
      this.removeAllKey();
      this.setActiveAccountAddress(undefined);
      this.$router.push("/initialize");
    });
  }
}
</script>

<style lang="sass" scoped>
.v-app-bar
  &__logo
    width: 40px
    height: 40px
  &__select
    max-width: 250px
  &__list
    overflow-y: auto
</style>