<template>
  <div class="v-restore-wallet-page pb-8">
    <TypePasswordModal ref="typePasswordModalRestoreWallet" />

    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">Restore account</h1>
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
          v-model="restoryType"
          :items="[
            {
              text: 'Seed phrase',
              value: 'seedPhrase',
            },
            {
              text: 'Keypair',
              value: 'keypair',
            },
          ]"
          label="Restory type"
          outlined
          :menu-props="{ 'offset-y': true, light: true }"
        ></VSelect>
        <VTextField
          autocomplete="off"
          dense
          v-if="restoryType === 'seedPhrase'"
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
          autocomplete="off"
          dense
          v-if="restoryType === 'keypair'"
          v-model.trim="publicKey"
          outlined
          label="Public key"
          :rules="[
            (v) => !!v || 'Public key is required',
            (v) => !iSSeedPhraseValid || 'Public key is invalid',
          ]"
          :success-messages="seedPhraseTips"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          v-if="restoryType === 'keypair'"
          v-model.trim="secretKey"
          outlined
          label="Secret key"
          :rules="[
            (v) => !!v || 'Secret key is required',
            (v) => !iSSeedPhraseValid || 'Secret key is invalid',
          ]"
          :success-messages="seedPhraseTips"
        ></VTextField>
        <div
          v-if="
            restoryType === 'seedPhrase'
              ? !isEmpty(seedPhraseTips) && iSSeedPhraseValid
              : !isEmpty(keyPairTips) && publicKey && secretKey
          "
        >
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
              <VBtn
                x-small
                v-clipboard="() => custodian"
                height="22"
                color="primary"
                class="mr-1"
              >
                Copy
              </VBtn>
              <VBtn
                x-small
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
                x-small
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
          :append-icon="
            isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          @click:append="() => (isHidePassword = !isHidePassword)"
          :type="isHidePassword ? 'password' : 'text'"
          outlined
          label="Confirm password"
        ></VTextField>
        <div class="d-flex justify-end">
          <VBtn
            x-small
            light
            color="white"
            width="80"
            link
            @click="$router.back()"
            class="mr-4"
          >
            Back
          </VBtn>
          <VBtn
            x-small
            width="80"
            color="primary"
            type="submit"
            :disabled="
              restoryType === 'seedPhrase'
                ? !valid || !name || !seedPhrase
                : !valid || !name || (!publicKey && !secretKey)
            "
          >
            Restore
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import {
  accountsModuleMapper,
  WalletType,
  walletsTypes,
  contracts,
} from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";
import { convertSeedToKeyPair, validateSeedPhrase } from "@/ton/ton.utils";
import TonContract from "@/ton/ton.contract";
import { KeyPair } from "@tonclient/core";
import { isEmpty } from "lodash";
import TypePasswordModal from "@/components/modals/TypePasswordModal.vue";
import { validatePassword } from "@/utils/validation";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkServer",
    ]),
    ...accountsModuleMapper.mapGetters(["accountsCount"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["addAccount"]),
    ...accountsModuleMapper.mapMutations(["addNetworkToAccount"]),
    ...walletModuleMapper.mapMutations(["setActiveAccountAddress"]),
  },
});

@Component({
  components: { Inner, TypePasswordModal },
  methods: { isEmpty, validatePassword },
})
export default class RestoreWalletPage extends Mappers {
  valid = true;

  name = "";
  walletType: WalletType = "safe-multisig";
  restoryType = "seedPhrase";
  seedPhrase = "";
  publicKey = "";
  secretKey = "";
  numberOfCustodians = 1;
  custodians = [""];

  password = "";
  confirmPassword = "";
  passwordErrors: string[] = [];

  isHidePassword = true;

  seedPhraseTips: string[] = [];
  keyPairTips: string[] = [];
  iSSeedPhraseValid = false;
  isDeployed = false;
  data() {
    return {
      walletsTypes,
    };
  }

  @Inject() showTypePasswordModal!: any;

  public get onChangeFields() {
    const {
      seedPhrase,
      walletType,
      activeNetworkServer,
      publicKey,
      secretKey,
    } = this;
    return {
      seedPhrase,
      walletType,
      activeNetworkServer,
      publicKey,
      secretKey,
    };
  }

  public get seedPhraseWorldCount(): number {
    return this.seedPhrase.split(" ").length;
  }

  @Watch("onChangeFields")
  async onChange() {
    try {
      if (this.restoryType === "seedPhrase") {
        const response = await validateSeedPhrase(
          tonService.client,
          this.seedPhrase,
          this.seedPhraseWorldCount
        );

        const isValid = response && response.valid;
        this.iSSeedPhraseValid = isValid;

        if (isValid) {
          const keypair = await this.getKeypair();
          this.custodians = [`0x${keypair.public}`];
          this.isDeployed = false;

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

          const custodians = response.value.custodians;
          this.seedPhraseTips = [];
          if (custodians) {
            this.isDeployed = true;
            this.custodians = custodians.map(
              (custodian: any) => custodian.pubkey
            );
            this.numberOfCustodians = custodians.length;
          }
        }
      }
      if (this.restoryType === "keypair") {
        if (this.publicKey && this.secretKey) {
          this.custodians = [`0x${this.publicKey}`];
          this.isDeployed = false;

          const contract = new TonContract({
            client: tonService.client,
            name: this.walletType,
            tonPackage: contracts[this.walletType],
            keys: { public: this.publicKey, secret: this.secretKey },
          });
          await contract.calcAddress();

          const response = await contract.run({
            functionName: "getCustodians",
          });

          const custodians = response.value.custodians;
          this.keyPairTips = [];
          if (custodians) {
            this.isDeployed = true;
            this.custodians = custodians.map(
              (custodian: any) => custodian.pubkey
            );
            this.numberOfCustodians = custodians.length;
          }
        }
      }
    } catch (error) {
      if (this.restoryType === "seedPhrase") {
        this.seedPhraseTips.push("The account is not active, enter custodians");
      }
      if (this.restoryType === "keypair") {
        this.keyPairTips.push("The account is not active, enter custodians");
      }
    }
  }

  public async getKeypair(): Promise<KeyPair> {
    return await convertSeedToKeyPair(
      tonService.client,
      this.seedPhrase,
      this.seedPhraseWorldCount
    );
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
      getKeypair,
      custodians,
      isDeployed,
      password,
      seedPhrase,
    } = this;
    if (this.restoryType === "seedPhrase") {
      if (this.accountsCount === 0) {
        const keypair = await getKeypair();
        await this.addAccount({
          keypair,
          custodians,
          walletType,
          networkServer: activeNetworkServer,
          name,
          client: tonService.client,
          isDeployed,
          password,
          seedPhrase,
          isRestoredWithKeyPair: false,
        });
        this.$router.push("/");
      } else {
        this.showTypePasswordModal().then(async (result: any) => {
          const keypair = await getKeypair();
          await this.addAccount({
            keypair,
            custodians,
            walletType,
            networkServer: activeNetworkServer,
            name,
            client: tonService.client,
            isDeployed,
            password: result.password,
            seedPhrase,
            isRestoredWithKeyPair: false,
          });
          this.$router.push("/");
        });
      }
    }
    if (this.restoryType === "keypair") {
      if (this.accountsCount === 0) {
        const keypair = {
          public: this.publicKey,
          secret: this.secretKey,
        };
        await this.addAccount({
          keypair,
          custodians,
          walletType,
          networkServer: activeNetworkServer,
          name,
          client: tonService.client,
          isDeployed,
          password,
          seedPhrase: "",
          isRestoredWithKeyPair: true,
        });
        this.$router.push("/");
      } else {
        this.showTypePasswordModal().then(async (result: any) => {
          const keypair = await getKeypair();
          await this.addAccount({
            keypair,
            custodians,
            walletType,
            networkServer: activeNetworkServer,
            name,
            client: tonService.client,
            isDeployed,
            password: result.password,
            seedPhrase: "",
            isRestoredWithKeyPair: true,
          });
          this.$router.push("/");
        });
      }
    }
  }
}
</script>

