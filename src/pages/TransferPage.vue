<template>
  <div class="transfer-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">Create transfer</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model="address"
          clearable
          outlined
          label="Address"
          :rules="[(v) => !!v || 'Address is required']"
        ></VTextField>

        <VTextField
          autocomplete="off"
          dense
          v-model.trim="amount"
          clearable
          outlined
          label="Amount"
          :rules="[
            (v) => !!`${v}` || 'Amount type is required',
            (v) => validateAmount(v),
          ]"
        ></VTextField>

        <VTextField
          autocomplete="off"
          dense
          class="mb-5"
          v-model.trim="message"
          outlined
          hide-details
          label="Message"
        ></VTextField>

        <div class="d-flex justify-end">
          <VBtn light x-small width="80" to="/" class="mr-4"> Back </VBtn>
          <VBtn
            x-small
            width="80"
            :loading="isPending"
            color="primary"
            type="submit"
            :disabled="!valid"
            >Create
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";
import { assetToBaseAmount, baseToAssetAmount } from "@/utils";
import BigNumber from "bignumber.js";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
    ...accountsModuleMapper.mapGetters(["getTokenBySymbol"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["transferOrProposeTransfer"]),
  },
});

@Component({
  components: { Inner },
})
export default class TransferPage extends Mappers {
  valid = true;

  isPending = false;

  address = "";
  amount = "";
  message = "";

  @Inject() showTypePasswordModal!: any;

  public get balance(): string {
    if (this.activeAccountAddress) {
      const token = this.getTokenBySymbol(this.activeAccountAddress, "TON");
      if (token) {
        return token.balance;
      }
    }
    return "";
  }

  validateAmount(v: string) {
    const balance = baseToAssetAmount(this.balance, "TON", 3);
    const isBalanceLessThenValue = new BigNumber(balance)
      .minus(0.011)
      .isLessThanOrEqualTo(v);
    if (isBalanceLessThenValue) {
      return `Insufficient funds. Your balance ${balance}`;
    }
    return true;
  }

  async onSubmit() {
    this.showTypePasswordModal(this.activeAccountAddress).then(
      async (result: any) => {
        if (this.activeAccountAddress) {
          this.isPending = true;
          await this.transferOrProposeTransfer({
            addressFrom: this.activeAccountAddress,
            addressTo: this.address,
            amount: assetToBaseAmount(this.amount, "TON"),
            client: tonService.client,
            message: this.message,
            keypair: result.keypair,
          });
          this.isPending = false;
          this.$router.push("/");
        }
      }
    );
  }
}
</script>

