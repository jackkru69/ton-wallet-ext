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
        <VTextField
          class="mb-8"
          v-model="name"
          clearable
          outlined
          hide-details
          label="Name"
        ></VTextField>
        <VSelect
          class="mb-8"
          v-model="walletType"
          :items="walletsTypes"
          label="Outlined style"
          outlined
          hide-details
        ></VSelect>
        <VTextField
          v-if="walletType !== 'original'"
          class="mb-8"
          v-model.trim="numberOfCustodians"
          clearable
          outlined
          hide-details
          label="Number of custodians"
        ></VTextField>
        <VSelect
          class="mb-8"
          v-model="seedPhraseWorldCount"
          :items="[12, 24]"
          label="Seed phrase world count"
          outlined
          hide-details
        ></VSelect>
        <VTextField
          class="mb-8"
          v-model.trim="seedPhrase"
          outlined
          hide-details
          label="Seed phrase"
          readonly
        >
          <template v-slot:append>
            <VBtn @click="generatePhrase" height="28" class="mr-3">
              Generate
            </VBtn>
            <VBtn v-clipboard="() => seedPhrase" height="28" color="primary">
              Copy
            </VBtn>
          </template></VTextField
        >
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
import { convertSeedToKeyPair, generateSeed } from "@/ton/ton.utils";
import {
  accountsModuleMapper,
  walletsTypes,
  WalletType,
} from "@/store/modules/accounts";
import { rootModuleMapper } from "@/store/root";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters(["network"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["createNewAccount"]),
    ...rootModuleMapper.mapActions(["setActiveAccountID"]),
  },
});

@Component({
  components: { Inner, VCard, VIcon, VTextField, VSelect, VForm, VBtn },
})
export default class CreateWalletPage extends Mappers {
  valid = true;
  name = "";
  walletType: WalletType = "safe-multisig";
  numberOfCustodians = 1;
  seedPhraseWorldCount = 12;
  seedPhrase = "";

  password = "";
  confirmPassword = "";

  data() {
    return {
      walletsTypes,
    };
  }

  async generatePhrase() {
    const seedPhrase: any = await generateSeed(this.seedPhraseWorldCount);
    this.seedPhrase = seedPhrase?.phrase;
  }

  async onSubmit() {
    const keypair = await convertSeedToKeyPair(
      this.seedPhrase,
      this.seedPhraseWorldCount
    );
    const { walletType, network, name, numberOfCustodians } = this;
    await this.createNewAccount({
      keypair,
      walletType,
      network,
      name,
      numberOfCustodians,
    });
    this.setActiveAccountID(0);
    this.$router.push("/");
  }

  async created() {
    this.generatePhrase();
  }
}
</script>

