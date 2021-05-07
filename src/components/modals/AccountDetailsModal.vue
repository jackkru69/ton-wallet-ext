<template>
  <VDialog light :retain-focus="false" v-model="model" max-width="325px">
    <VCard>
      <VCardTitle>
        <h3>Account details</h3>
      </VCardTitle>
      <VCardText>
        <VTextField
          autocomplete="off"
          v-model.trim="modelAccountName"
          clearable
          :rules="[(v) => !!v || 'Name is required']"
          outlined
          label="Name"
        >
        </VTextField>
        <h4>Wallet type</h4>
        <div class="mb-4">{{ account && account.walletType }}</div>
        <h4>Public key</h4>
        <div class="d-flex justify-space-between align-center mb-4">
          {{ sliceString(publicKey, 12) }}
          <VBtn
            x-small
            v-clipboard="() => publicKey"
            type="button"
            icon
            class="ml-2"
          >
            <VIcon> mdi-content-copy </VIcon>
          </VBtn>
        </div>
        <h4>Custodians</h4>
        <div>
          <div
            v-for="(custodian, i) in account.custodians"
            :key="i"
            class="d-flex justify-space-between align-center"
          >
            {{ sliceString(custodian, 14) }}
            <VBtn
              x-small
              v-clipboard="() => custodian"
              type="button"
              icon
              class="ml-2"
            >
              <VIcon> mdi-content-copy </VIcon>
            </VBtn>
          </div>
        </div>
        <div class="my-4" v-if="!account.isRestoredWithKeyPair">
          <VBtn
            x-small
            @click="onClickExportSeedPhrase"
            v-if="!seedPhrase"
            width="100%"
            color="primary"
          >
            Export Seed Phrase</VBtn
          >
          <VTextarea
            v-if="seedPhrase"
            outlined
            v-model="seedPhrase"
            auto-grow
            rows="3"
            readonly
            hide-details
            label="Seed Phrase"
          ></VTextarea>
        </div>
        <VBtn
          x-small
          @click="onClickExportSecretPhrase"
          v-if="!secretKey"
          width="100%"
          color="primary"
        >
          Export Secret Key</VBtn
        >
        <VTextarea
          v-if="secretKey"
          outlined
          v-model="secretKey"
          auto-grow
          rows="3"
          hide-details
          readonly
          label="Secret Key"
        ></VTextarea>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import {
  AccountInterface,
  accountsModuleMapper,
} from "@/store/modules/accounts";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { walletModuleMapper } from "@/store/modules/wallet";
import { sliceString } from "@/utils";
import {
  Component,
  Inject,
  Prop,
  VModel,
  Vue,
  Watch,
} from "vue-property-decorator";

const Mappers = Vue.extend({
  computed: {
    ...keystoreModuleMapper.mapGetters(["getPrivateData", "getPublicKeyData"]),
    ...accountsModuleMapper.mapGetters(["accountNameByAddress"]),
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
    modelAccountName: {
      get() {
        return this.accountNameByAddress(this.activeAccountAddress);
      },
      set(value: string) {
        this.changeAccountName({
          address: this.activeAccountAddress,
          newName: value,
        });
      },
    },
  },
  methods: {
    ...accountsModuleMapper.mapMutations(["changeAccountName"]),
  },
});

@Component({ methods: { sliceString } })
export default class AccountDetailsModal extends Mappers {
  @VModel() model: boolean;
  @Prop() account: AccountInterface;
  valid = true;

  @Inject() showTypePasswordModal!: any;

  secretKey = "";
  seedPhrase = "";

  public get publicKey(): string {
    if (this.activeAccountAddress) {
      return this.getPublicKeyData(this.activeAccountAddress);
    }
    return "";
  }

  onClickExportSeedPhrase() {
    this.showTypePasswordModal(this.activeAccountAddress).then(
      async (result: any) => {
        this.seedPhrase = result.seedPhrase;
      }
    );
  }

  onClickExportSecretPhrase() {
    this.showTypePasswordModal(this.activeAccountAddress).then(
      async (result: any) => {
        this.secretKey = result.keypair.secret;
      }
    );
  }

  @Watch("model")
  onChangeModel() {
    this.seedPhrase = "";
    this.secretKey = "";
  }
}
</script>
