<template>
  <div class="v-create-wallet-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-8">Add wallet</h1>
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
        <!-- <VTextField
          v-if="walletType !== 'original'"
          class="mb-4"
          v-model.trim="numberOfCustodians"
          clearable
          outlined
          label="Number of custodians"
          :rules="[(v) => !!`${v}` || 'Wallet type is required']"
        ></VTextField> -->
        <VSelect
          class="mb-4"
          v-model="seedPhraseWorldCount"
          :items="[12, 24]"
          label="Seed phrase world count"
          outlined
          :rules="[
            (v) => !!`${v}` || 'Seed phrase world count type is required',
          ]"
        ></VSelect>
        <VTextField
          v-for="(phrase, index) in phrases"
          :key="index"
          class="mb-4"
          v-model.trim="phrases[index]"
          outlined
          hide-details
          label="Seed phrase"
        >
          <template v-slot:append>
            <VBtn @click="generate(index)" height="22" class="mr-3">
              Generate
            </VBtn>
            <VBtn
              v-clipboard="() => seedPhrase"
              height="22"
              color="primary"
              class="mr-1"
            >
              Copy
            </VBtn>
            <VBtn v-if="index !== 0" plain icon height="22" color="red">
              <VIcon>mdi-minus</VIcon>
            </VBtn>
            <VBtn
              v-if="index === phrases.length - 1"
              @click="generate(index, true)"
              plain
              icon
              height="22"
              color="green"
            >
              <VIcon>mdi-plus</VIcon>
            </VBtn>
          </template>
        </VTextField>
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
            :disabled="!valid || !name || isEmpty(phrases)"
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
import {
  accountsModuleMapper,
  walletsTypes,
  WalletType,
} from "@/store/modules/accounts";
import { rootModuleMapper } from "@/store/root";
import { tonService } from "@/background";
import { isEmpty } from "lodash";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters(["activeNetworkID"]),
    ...accountsModuleMapper.mapGetters(["accountsCount"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["addAccount"]),
    ...rootModuleMapper.mapActions(["setActiveAccountID"]),
    isEmpty,
  },
});

@Component({
  components: { Inner, VCard, VIcon, VTextField, VSelect, VForm, VBtn },
})
export default class CreateWalletPage extends Mappers {
  valid = true;
  name = "";
  walletType: WalletType = "safe-multisig";
  seedPhraseWorldCount = 12;
  seedPhrase = "";

  password = "";
  confirmPassword = "";

  phrases: string[] = [];

  data() {
    return {
      walletsTypes,
    };
  }

  async generatePhrase() {
    const seedPhrase: any = await generateSeed(
      tonService.client,
      this.seedPhraseWorldCount
    );
    return seedPhrase;
  }

  async generate(i: number, add: boolean) {
    const response: any = await this.generatePhrase();
    if (!add) {
      this.phrases[i] = response.phrase;
    } else {
      this.phrases.push(response.phrase);
    }
  }

  async onSubmit() {
    const keypair = await convertSeedToKeyPair(
      tonService.client,
      this.seedPhrase,
      this.seedPhraseWorldCount
    );
    const {
      walletType,
      activeNetworkID,
      name,
      // numberOfCustodians,
      accountsCount,
    } = this;
    // await this.addAccount({
    //   keypair,
    //   walletType,
    //   activeNetworkID,
    //   name,
    //   numberOfCustodians,
    //   client: tonService.client,
    //   isRestore: false,
    // });
    this.setActiveAccountID(accountsCount);
    this.$router.push("/");
  }

  async created() {
    const response: any = await this.generatePhrase();
    this.phrases.push(response.phrase);
  }
}
</script>

