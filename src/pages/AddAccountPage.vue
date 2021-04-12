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
          class="mb-4"
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
        <h2 class="mb-4">Custodians: {{ custodians.length }}</h2>
        <VTextField
          v-for="(custodian, index) in custodians"
          :key="index"
          class="mb-4"
          v-model.trim="custodians[index]"
          outlined
          label="Custodian"
          :rules="[(v) => !!`${v}` || 'Custodian is required']"
        >
          <template v-slot:append>
            <VBtn
              v-clipboard="() => custodian"
              height="22"
              color="primary"
              class="mr-1"
            >
              Copy
            </VBtn>
            <VBtn
              @click="deleteByIndex(index)"
              v-if="index !== 0"
              plain
              icon
              height="22"
              color="red"
            >
              <VIcon>mdi-minus</VIcon>
            </VBtn>
            <VBtn
              v-if="index === custodians.length - 1"
              @click="addNewField(custodians.length)"
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
            :disabled="!valid || !name || isEmpty(custodians)"
          >
            Add
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { KeyPair } from "@tonclient/core";
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
  keypair: KeyPair;
  custodians: string[] = [];

  data() {
    return {
      walletsTypes,
    };
  }

  @Watch("seedPhraseWorldCount")
  async onChangeSeedPhraseWorldCount() {
    await this.generatePhrase();
  }

  async generatePhrase() {
    const seedPhrase: any = await generateSeed(
      tonService.client,
      this.seedPhraseWorldCount
    );
    this.seedPhrase = seedPhrase?.phrase;
    const keypair = await convertSeedToKeyPair(
      tonService.client,
      seedPhrase?.phrase,
      this.seedPhraseWorldCount
    );
    this.keypair = keypair;
    this.$set(this.custodians, 0, `0x${keypair.public}`);
  }

  addNewField(i: number) {
    this.$set(this.custodians, i, "");
  }

  deleteByIndex(i: number) {
    this.$delete(this.custodians, i);
  }

  async onSubmit() {
    const {
      walletType,
      activeNetworkID,
      name,
      accountsCount,
      custodians,
      keypair,
    } = this;

    await this.addAccount({
      keypair,
      custodians,
      walletType,
      activeNetworkID,
      name,
      numberOfCustodians: custodians.length,
      client: tonService.client,
      isRestored: false,
      isDeployed: false,
    });
    this.setActiveAccountID(accountsCount);
    this.$router.push("/");
  }

  async created() {
    await this.generatePhrase();
  }
}
</script>

