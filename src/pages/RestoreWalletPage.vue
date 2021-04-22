<template>
  <div class="v-restore-wallet-page py-8">
    <TypePasswordModal ref="typePasswordModalRestoreWallet" />

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
        <div v-if="!isEmpty(seedPhraseTips) && iSSeedPhraseValid">
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
        </div>
        <VTextField
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

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkID",
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
  methods: { isEmpty },
})
export default class RestoreWalletPage extends Mappers {
  valid = true;

  name = "";
  walletType: WalletType = "safe-multisig";
  seedPhrase = "";
  numberOfCustodians = 1;
  custodians = [""];
  password = "";
  confirmPassword = "";
  seedPhraseTips: string[] = [];
  iSSeedPhraseValid = false;
  isDeployed = false;
  data() {
    return {
      walletsTypes,
    };
  }

  @Inject() showTypePasswordModal!: any;

  public get onChangeSeedPhraseAndWalletTypeAndNetwork() {
    const { seedPhrase, walletType, activeNetworkID } = this;
    return {
      seedPhrase,
      walletType,
      activeNetworkID,
    };
  }

  public get seedPhraseWorldCount(): number {
    return this.seedPhrase.split(" ").length;
  }

  @Watch("onChangeSeedPhraseAndWalletTypeAndNetwork")
  async onChangeSeedPhrase() {
    try {
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
    } catch (error) {
      this.seedPhraseTips.push("The account is not active, enter custodians");
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
      activeNetworkID,
      name,
      getKeypair,
      custodians,
      isDeployed,
      password,
      seedPhrase,
    } = this;
    if (this.accountsCount === 0) {
      const keypair = await getKeypair();
      await this.addAccount({
        keypair,
        custodians,
        walletType,
        network: activeNetworkID,
        name,
        client: tonService.client,
        isDeployed,
        password,
        seedPhrase,
      });
      this.$router.push("/");
    } else {
      this.showTypePasswordModal.then(async (result: any) => {
        const keypair = await getKeypair();
        await this.addAccount({
          keypair,
          custodians,
          walletType,
          network: activeNetworkID,
          name,
          client: tonService.client,
          isDeployed,
          password: result.password,
          seedPhrase,
        });
        this.$router.push("/");
      });
    }
  }
}
</script>

