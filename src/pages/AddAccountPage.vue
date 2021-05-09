<template>
  <div class="v-add-account-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">Add wallet</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model="name"
          clearable
          outlined
          label="Name"
          :rules="[(v) => !!v || 'Name is required']"
        ></VTextField>
        <VSelect
          dense
          v-model="walletType"
          :items="walletsTypes"
          label="Wallet type"
          outlined
          :menu-props="{ 'offset-y': true, light: true }"
        ></VSelect>
        <VSelect
          dense
          class="mb-5"
          v-model="seedPhraseWorldCount"
          :items="[12, 24]"
          label="World count"
          outlined
          hide-details
          :menu-props="{ 'offset-y': true, light: true }"
          :rules="[(v) => !!`${v}` || 'World count type is required']"
        ></VSelect>
        <div class="d-flex justify-end mb-5">
          <VBtn
            min-width="30"
            :style="{ padding: 0 }"
            class="mr-3"
            x-small
            @click="generatePhrase"
            color="primary"
          >
            <VIcon small> mdi-autorenew</VIcon>
          </VBtn>
          <VBtn
            min-width="30"
            :style="{ padding: 0 }"
            x-small
            v-clipboard="() => seedPhrase"
            color="primary"
          >
            <VIcon small> mdi-content-copy</VIcon>
          </VBtn>
        </div>
        <div class="v-add-account-page__grid-table mb-5">
          <div
            class="v-add-account-page__grid-table-item"
            v-for="(word, i) in formattedSeedPhrase"
            :key="i"
          >
            {{ word }}
          </div>
        </div>
        <VTextField
          autocomplete="off"
          dense
          clearable
          v-if="accountsCount === 0"
          v-model.trim="password"
          :rules="[
            (v) => !!v || 'Password is required',
            (v) => validatePassword(v),
          ]"
          outlined
          label="Password"
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          :error-messages="passwordErrors"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          clearable
          v-if="accountsCount === 0"
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
        <div class="d-flex align-center justify-space-between mb-5">
          <h2>Custodians: {{ custodians.length }}</h2>
          <VBtn
            min-width="30"
            :style="{ padding: 0 }"
            x-small
            @click="addNewField(custodians.length)"
            color="primary"
          >
            <VIcon small> mdi-plus-thick</VIcon>
          </VBtn>
        </div>

        <VTextField
          autocomplete="off"
          dense
          v-for="(custodian, index) in custodians"
          :key="index"
          v-model.trim="custodians[index]"
          outlined
          label="Custodian"
          :rules="[(v) => !!`${v}` || 'Custodian is required']"
        >
          <template v-slot:append>
            <div class="v-add-account-page__btn-inner">
              <VBtn
                min-width="30"
                :style="{ padding: 0 }"
                x-small
                v-clipboard="() => custodian"
                color="primary"
              >
                <VIcon small> mdi-content-copy</VIcon>
              </VBtn>
              <VBtn
                min-width="30"
                :style="{ padding: 0 }"
                x-small
                @click="deleteByIndex(index)"
                v-if="index !== 0"
                class="ml-1"
              >
                <VIcon small> mdi-close</VIcon>
              </VBtn>
            </div>
          </template>
        </VTextField>

        <div class="d-flex justify-end">
          <VBtn
            width="80"
            light
            color="white"
            x-small
            @click="$router.back()"
            class="mr-4"
          >
            Back
          </VBtn>
          <VBtn
            width="80"
            x-small
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
    ...rootModuleMapper.mapMutations(["setIsLocked"]),
    isEmpty,
    validatePassword,
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

  isHidePassword = true;

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

  public get formattedSeedPhrase() {
    return this.seedPhrase
      .split(" ")
      .map((word, index) => `${index + 1}. ${word}`);
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

<style lang="sass" scoped>
.v-add-account-page
  &__btn-inner
    margin-top: -3px
    margin-right: -7px

  &__grid-table
    display: grid
    grid-template-columns: 1fr 1fr 1fr 1fr
    grid-column-gap: 4px
    grid-row-gap: 4px
    border: 1px solid #FFFFFF
    box-sizing: border-box
    border-radius: 5px
    padding: 14px
    &-item
      line-height: 20px
</style>