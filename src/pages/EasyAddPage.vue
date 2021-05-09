<template >
  <div v-if="accountsCount === 0" class="v-create-wallet-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">Easy add wallet</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model.trim="password"
          :rules="[
            (v) => !!v || 'Password is required',
            (v) => validatePassword(v),
          ]"
          outlined
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          label="Password"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          v-model.trim="confirmPassword"
          :rules="[
            (v) => !!v || 'Confirm password is required',
            (v) => password === v || 'Passwords don\'t match',
          ]"
          outlined
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          label="Confirm password"
        ></VTextField>
        <div class="d-flex justify-end">
          <VBtn
            x-small
            width="80"
            to="/initialize"
            class="mr-4"
            color="white"
            light
          >
            Back
          </VBtn>
          <VBtn
            x-small
            width="80"
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
import { convertSeedToKeyPair, generateSeed } from "@/ton/ton.utils";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";
import { isEmpty } from "lodash";
import { validatePassword } from "@/utils/validation";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeNetworkServer"]),
    ...accountsModuleMapper.mapGetters([
      "getAccountByAddress",
      "accountsCount",
    ]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["addAccount"]),
    isEmpty,
    validatePassword,
  },
});

@Component({
  components: { Inner },
})
export default class CreateWalletPage extends Mappers {
  valid = true;

  password = "";
  confirmPassword = "";

  isHidePassword = true;

  async onSubmit() {
    const seedPhrase: any = await generateSeed(tonService.client, 12);
    const keypair = await convertSeedToKeyPair(
      tonService.client,
      seedPhrase?.phrase,
      12
    );
    const { activeNetworkServer, accountsCount, password } = this;
    await this.addAccount({
      keypair,
      custodians: [`0x${keypair.public}`],
      walletType: "safe-multisig",
      networkServer: activeNetworkServer,
      name: `Account ${accountsCount + 1}`,
      client: tonService.client,
      password: password,
      seedPhrase: seedPhrase?.phrase,
      isRestoredWithKeyPair: false,
    });
    this.$router.push("/");
  }
}
</script>

