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
          dense
          class="mb-4"
          v-model="name"
          clearable
          outlined
          label="Name"
          :rules="[(v) => !!v || 'Name is required']"
        ></VTextField>
        <VSelect
          dense
          class="mb-4"
          v-model="walletType"
          :items="walletsTypes"
          label="Wallet type"
          outlined
        ></VSelect>
        <VSelect
          dense
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
          dense
          class="mb-4"
          v-model.trim="seedPhrase"
          outlined
          label="Seed phrase"
          readonly
        >
          <template v-slot:append>
            <VBtn @click="generatePhrase" class="mr-3"> Generate </VBtn>
            <VBtn v-clipboard="() => seedPhrase" color="primary"> Copy </VBtn>
          </template></VTextField
        >
        <VTextField
          dense
          v-if="accountsCount === 0"
          class="mb-4"
          v-model.trim="password"
          clearable
          :rules="[(v) => !!v || 'Password is required']"
          outlined
          label="Password"
          :error-messages="passwordErrors"
        ></VTextField>
        <VTextField
          dense
          v-if="accountsCount === 0"
          class="mb-4"
          v-model.trim="confirmPassword"
          clearable
          :rules="[
            (v) => !!v || 'Confirm password is required',
            (v) => password === v || 'Passwords don\'t match',
          ]"
          outlined
          label="Confirm password"
        ></VTextField>
        <h2 class="mb-4">Custodians: {{ custodians.length }}</h2>
        <VTextField
          dense
          v-for="(custodian, index) in custodians"
          :key="index"
          class="mb-4"
          v-model.trim="custodians[index]"
          outlined
          label="Custodian"
          :rules="[(v) => !!`${v}` || 'Custodian is required']"
        >
          <template v-slot:append>
            <VBtn v-clipboard="() => custodian" color="primary" class="mr-1">
              Copy
            </VBtn>
            <VBtn
              @click="deleteByIndex(index)"
              v-if="index !== 0"
              plain
              icon
              color="red"
            >
              <VIcon>mdi-minus</VIcon>
            </VBtn>
            <VBtn
              v-if="index === custodians.length - 1"
              @click="addNewField(custodians.length)"
              plain
              icon
              color="green"
            >
              <VIcon>mdi-plus</VIcon>
            </VBtn>
          </template>
        </VTextField>

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
import { Component, Inject, Vue, Watch } from "vue-property-decorator";
import { KeyPair } from "@tonclient/core";
import Inner from "@/components/layout/Inner.vue";
import { convertSeedToKeyPair, generateSeed } from "@/ton/ton.utils";
import {
  accountsModuleMapper,
  walletsTypes,
  WalletType,
} from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";
import { isEmpty } from "lodash";
import { rootModuleMapper } from "@/store/root";
import TypePasswordModal from "@/components/modals/TypePasswordModal.vue";

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
    ...rootModuleMapper.mapMutations(["setIsLocked"]),
    isEmpty,
  },
});

@Component({
  components: { Inner, TypePasswordModal },
})
export default class CreateWalletPage extends Mappers {
  valid = true;
  name = "";
  walletType: WalletType = "safe-multisig";
  seedPhraseWorldCount = 12;
  seedPhrase = "";

  password = "";
  confirmPassword = "";

  passwordErrors: string[] = [];

  keypair: KeyPair;
  custodians: string[] = [];

  data() {
    return {
      walletsTypes,
    };
  }

  @Inject() showTypePasswordModal!: any;

  @Watch("password")
  onChangePassword() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
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
      activeNetworkServer,
      name,
      custodians,
      keypair,
      seedPhrase,
      password,
    } = this;
    if (this.accountsCount === 0) {
      await this.addAccount({
        keypair,
        custodians,
        walletType,
        networkServer: activeNetworkServer,
        name,
        client: tonService.client,
        password,
        seedPhrase,
        isRestoredWithKeyPair: false,
      });
      this.$router.push("/");
    } else {
      this.showTypePasswordModal().then(async (result: any) => {
        await this.addAccount({
          keypair,
          custodians,
          walletType,
          networkServer: activeNetworkServer,
          name,
          client: tonService.client,
          password: result.password,
          seedPhrase,
          isRestoredWithKeyPair: false,
        });
        this.$router.push("/");
      });
    }
  }

  async mounted() {
    await this.generatePhrase();
  }
}
</script>

