<template>
  <div class="v-restore-wallet-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-8">Restore wallet</h1>
        <VTextField
          class="mb-4"
          v-model="name"
          clearable
          outlined
          label="Name"
          :rules="[(v) => !!v || 'Name is required']"
        ></VTextField>
        <VSelect
          class="mb-4"
          v-model="walletType"
          :items="walletsTypes"
          label="Wallet type"
          outlined
        ></VSelect>
        <VTextField
          class="mb-4"
          v-model.trim="seedPhrase"
          outlined
          label="Seed phrase"
          :rules="[
            (v) => !!v || 'Seed phrase is required',
            (v) => !iSSeedPhraseValid || 'Seed phrase is invalid',
          ]"
          :success-messages="seedPhraseTips"
        ></VTextField>
        <VTextField
          v-if="!isEmpty(seedPhraseTips) && iSSeedPhraseValid"
          class="mb-4"
          v-model.trim="numberOfCustodians"
          clearable
          outlined
          label="Number of custodians"
          :rules="[
            (v) => !!`${v}` || 'Number of custodian type is required',
            (v) => v !== 0 || 'Must not be zero',
            (v) => v <= 32 || 'Must be less than or equal to 32',
          ]"
        ></VTextField>
        <!-- <h2 class="mb-8">Password</h2>
        <VTextField
          class="mb-8"
          v-model.trim="password"
          clearable
          outlined
          hide-details
          label="Password"
        ></VTextField>
        <VTextField
          class="mb-8"
          v-model.trim="confirmPassword"
          clearable
          outlined
          hide-details
          label="Confirm password"
        ></VTextField> -->
        <div class="d-flex justify-end">
          <VBtn to="/initialize" class="mr-4"> Back </VBtn>
          <VBtn
            color="primary"
            type="submit"
            :disabled="!valid || !name || !seedPhrase"
            >Restore
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import {
  accountsModuleMapper,
  WalletType,
  walletsTypes,
  contracts,
} from "@/store/modules/accounts";
import { rootModuleMapper } from "@/store/root";
import { tonService } from "@/background";
import { convertSeedToKeyPair, validateSeedPhrase } from "@/ton/ton.utils";
import TonContract from "@/ton/ton.contract";
import { KeyPair } from "@tonclient/core";
import { isEmpty } from "lodash";
const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters(["activeAccountID", "activeNetworkID"]),
    ...accountsModuleMapper.mapGetters(["accountsCount"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["addAccount"]),
    ...rootModuleMapper.mapActions(["setActiveAccountID"]),
  },
});

@Component({
  components: { Inner },
  methods: { isEmpty },
})
export default class RestoreWalletPage extends Mappers {
  valid = true;

  name = "";
  walletType: WalletType = "safe-multisig";
  seedPhrase = "";
  numberOfCustodians = 1;

  password = "";
  confirmPassword = "";
  seedPhraseTips: string[] = [];
  iSSeedPhraseValid = false;

  data() {
    return {
      walletsTypes,
    };
  }

  public get onChangeSeedPhraseAndWalletTypeAndNetwork() {
    const { seedPhrase, walletType, activeNetworkID } = this;
    return {
      seedPhrase,
      walletType,
      activeNetworkID,
    };
  }

  @Watch("onChangeSeedPhraseAndWalletTypeAndNetwork")
  async onChangeSeedPhrase() {
    try {
      const isValid = await validateSeedPhrase(
        tonService.client,
        this.seedPhrase,
        this.seedPhraseWorldCount
      );
      this.iSSeedPhraseValid = !!isValid;
      if (isValid) {
        const keypair = await this.getKeypair();
        const contract = new TonContract({
          client: tonService.client,
          name: this.walletType,
          tonPackage: contracts[this.walletType],
          keys: keypair,
        });
        await contract.calcAddress();

        const response = await contract.run({
          functionName: "getCustodians",
        });

        this.numberOfCustodians = response.value.custodians.length;
        this.seedPhraseTips = [];
      }
    } catch (error) {
      this.seedPhraseTips.push(
        "The account is not active, enter the number of custodians"
      );
    }
  }

  public async getKeypair(): Promise<KeyPair> {
    return await convertSeedToKeyPair(
      tonService.client,
      this.seedPhrase,
      this.seedPhraseWorldCount
    );
  }

  public get seedPhraseWorldCount(): number {
    return this.seedPhrase.split(" ").length;
  }

  async onSubmit() {
    const {
      walletType,
      activeNetworkID,
      name,
      numberOfCustodians,
      getKeypair,
      accountsCount,
    } = this;
    const keypair = await getKeypair();
    await this.addAccount({
      keypair,
      walletType,
      activeNetworkID,
      name,
      numberOfCustodians,
      client: tonService.client,
      isRestore: true,
    });

    this.setActiveAccountID(accountsCount);
    this.$router.push("/");
  }
}
</script>

