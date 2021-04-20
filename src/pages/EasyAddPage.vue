<template>
  <div class="v-create-wallet-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-8">Easy add wallet</h1>
        <h2 class="mb-8">Password</h2>
        <VTextField
          class="mb-8"
          v-model.trim="password"
          clearable
          :rules="[(v) => !!v || 'Password is required']"
          outlined
          label="Password"
        ></VTextField>
        <VTextField
          class="mb-8"
          v-model.trim="confirmPassword"
          clearable
          :rules="[
            (v) => !!v || 'Confirm password is required',
            (v) => password === v || 'Passwords don\'t match',
          ]"
          outlined
          label="Confirm password"
        ></VTextField>
        <div class="d-flex justify-end">
          <VBtn to="/initialize" class="mr-4"> Back </VBtn>
          <VBtn
            color="primary"
            type="submit"
            :disabled="!password || !confirmPassword"
          >
            Add
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard, VIcon, VTextField, VSelect, VForm, VBtn } from "vuetify/lib";
import { convertSeedToKeyPair, generateSeed } from "@/ton/ton.utils";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";
import { isEmpty } from "lodash";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeNetworkID"]),
    ...accountsModuleMapper.mapGetters([
      "getAccountByAddress",
      "accountsCount",
    ]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["addAccount"]),
    isEmpty,
  },
});

@Component({
  components: { Inner, VCard, VIcon, VTextField, VSelect, VForm, VBtn },
})
export default class CreateWalletPage extends Mappers {
  valid = true;

  password = "";
  confirmPassword = "";

  async onSubmit() {
    const seedPhrase: any = await generateSeed(tonService.client, 12);
    const keypair = await convertSeedToKeyPair(
      tonService.client,
      seedPhrase?.phrase,
      12
    );
    const { activeNetworkID, accountsCount, password } = this;
    await this.addAccount({
      keypair,
      custodians: [`0x${keypair.public}`],
      walletType: "safe-multisig",
      network: activeNetworkID,
      name: `Account ${accountsCount + 1}`,
      client: tonService.client,
      password: password,
    });
    this.$router.push("/");
  }
}
</script>

