<template>
  <VDialog :retain-focus="false" v-model="model" max-width="325px">
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

        <div class="mb-4">
          <VBtn
            x-small
            @click="onClickExportSeedPhrase"
            v-if="!seedPhrase"
            width="100%"
            color="primary"
          >
            Export Seed phrase</VBtn
          >
          <VTextarea
            v-if="seedPhrase"
            outlined
            v-model="seedPhrase"
            auto-grow
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
