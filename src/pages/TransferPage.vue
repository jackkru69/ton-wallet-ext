<template>
  <div class="transfer-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-8">Create transfer</h1>
        <VTextField
          class="mb-4"
          v-model="address"
          clearable
          outlined
          label="Address"
          :rules="[(v) => !!v || 'Address is required']"
        ></VTextField>

        <VTextField
          class="mb-4"
          v-model.trim="amount"
          clearable
          outlined
          label="Amount"
          :rules="[(v) => !!`${v}` || 'Amount type is required']"
        ></VTextField>

        <VTextField
          class="mb-4"
          v-model.trim="message"
          outlined
          hide-details
          label="Message"
          readonly
        ></VTextField>

        <div class="d-flex justify-end">
          <VBtn to="/" class="mr-4"> Back </VBtn>
          <VBtn color="primary" type="submit" :disabled="!valid">Create </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { tonService } from "@/background";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
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

  address = "";
  amount = "";
  message = "";

  async onSubmit() {
    if (this.activeAccountAddress) {
      await this.transferOrProposeTransfer({
        addressFrom: this.activeAccountAddress,
        addressTo: this.address,
        amount: this.amount,
        client: tonService.client,
        message: this.message,
      });
      this.$router.push("/");
    }
  }
}
</script>

