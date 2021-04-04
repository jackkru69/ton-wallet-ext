<template>
  <div class="v-create-wallet-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-8">Create wallet</h1>
        <VSelect
          class="mb-8"
          v-model="walletType"
          :items="walletsTypes"
          label="Outlined style"
          solo
          hide-details
        ></VSelect>
        <VTextField
          v-if="walletType !== 'original'"
          class="mb-8"
          v-model.trim="numberOfCustodians"
          clearable
          solo
          hide-details
          label="Number of custodians"
        ></VTextField>
        <h2 class="mb-8">Password</h2>
        <VTextField
          class="mb-8"
          v-model.trim="password"
          clearable
          solo
          hide-details
          label="Password"
        ></VTextField>
        <VTextField
          class="mb-8"
          v-model.trim="confirmPassword"
          clearable
          solo
          hide-details
          label="Confirm password"
        ></VTextField>
        <div class="d-flex justify-end">
          <VBtn class="mr-4"> Back </VBtn>
          <VBtn color="primary" type="submit">Create </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard, VIcon, VTextField, VSelect, VForm, VBtn } from "vuetify/lib";
import { tonService } from "@/background";

@Component({
  components: { Inner, VCard, VIcon, VTextField, VSelect, VForm, VBtn },
})
export default class CreateWalletPage extends Vue {
  walletType = "original";
  numberOfCustodians = "";
  password = "";
  confirmPassword = "";

  walletsTypes = [
    {
      text: "Original TON wallet",
      value: "original",
    },
    {
      text: "Safe Multisig TON wallet",
      value: "safe-multisig",
    },
    {
      text: "Set Code Multisig TON wallet",
      value: "set-code-multisig",
    },
    {
      text: "Set Code Multisig 2 TON wallet",
      value: "set-code-multisig2",
    },
  ];
}
</script>

<style lang="sass" scoped>
.v-create-wallet-page
</style>