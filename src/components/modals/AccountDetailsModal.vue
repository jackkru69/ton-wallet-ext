<template>
  <VDialog v-model="model" max-width="325px">
    <VCard>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="resolvePromise"
      >
        <VCardTitle>
          <h3>Account details</h3>
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model.trim="modelAccountName"
            clearable
            :rules="[(v) => !!v || 'Name is required']"
            outlined
            label="Name"
          ></VTextField
        ></VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { accountsModuleMapper } from "@/store/modules/accounts";
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { walletModuleMapper } from "@/store/modules/wallet";
import { Component, VModel, Vue } from "vue-property-decorator";

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

@Component
export default class AccountDetailsModal extends Mappers {
  @VModel() model: boolean;
  valid = true;

  public get publicKey(): string {
    if (this.activeAccountAddress) {
      return this.getPublicKeyData(this.activeAccountAddress);
    }
    return "";
  }
}
</script>
