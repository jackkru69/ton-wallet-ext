<template>
  <div class="v-confirm-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="confirmTx"
      >
        <h1 class="mb-5">Confirm transaction</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model="address"
          clearable
          outlined
          label="Address"
          :rules="[
            (v) => !!v || 'Address is required',
            (v) => validateAddress(v) || 'invalid address format',
          ]"
        ></VTextField>

        <VDataTable
          class="v-confirm-page__table mb-5"
          v-if="address && isCustodian === true && pendingTxs"
          v-model="selected"
          :loading="isTxsPending"
          :headers="headersPendingTxs"
          :items="fPendingTxs"
          :items-per-page="5"
          disable-pagination
          hide-default-footer
          mobile-breakpoint="0"
          item-key="id"
          show-select
          :item-class="() => 'table-item'"
        >
          <template v-slot:[`item.confirmation`]="{ item }">{{
            item.signsReceived + "/" + item.signsRequired
          }}</template>
        </VDataTable>
        <div class="d-flex justify-end">
          <VBtn color="white" light x-small width="80" to="/" class="mr-4">
            Back
          </VBtn>
          <VBtn
            x-small
            width="80"
            :loading="isPending"
            type="submit"
            color="primary"
            :disabled="!valid"
            >Confirm
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { accountsModuleMapper, contracts } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import TonContract from "@/ton/ton.contract";
import { tonService } from "@/background";
import { TxPendingType } from "@/types/transactions";
import { baseToAssetAmount, sliceString } from "@/utils";
import { validateAddress } from "@/ton/ton.utils";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
    ...accountsModuleMapper.mapGetters(["getAccountByAddress"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["transferOrProposeTransfer"]),
    validateAddress,
  },
});

@Component({
  components: { Inner },
})
export default class TransferPage extends Mappers {
  valid = true;

  isCustodian: any = null;

  selected = [];

  isTxsPending = false;
  isPending = false;

  address = "";

  pendingTxs = [];

  headersPendingTxs = [
    {
      text: "Creator",
      value: "fCreator",
      sortable: false,
    },
    {
      text: "To",
      value: "to",
      sortable: false,
    },
    {
      text: "Amount",
      value: "fValue",
      sortable: false,
    },
    {
      text: "Сonfirmation",
      value: "confirmation",
      sortable: false,
    },
  ];

  formatPendingTx(tx: TxPendingType) {
    return {
      ...tx,
      fId: sliceString(tx.id),
      fCreator: sliceString(tx.creator),
      to: sliceString(tx.dest),
      fValue: baseToAssetAmount(tx.value, "TON", 3),
    };
  }

  public get isValidAddress(): boolean {
    return this.address.match(/^(-1|0):[a-fA-F0-9]{64}$/g) !== null;
  }

  public get contract() {
    if (this.isValidAddress) {
      return new TonContract({
        client: tonService.client,
        address: this.address,
        name: "safe-multisig",
        tonPackage: contracts["safe-multisig"],
      });
    }
    return false;
  }

  public get fPendingTxs() {
    return this.pendingTxs.map(this.formatPendingTx);
  }

  async fetchPendingTxs() {
    if (this.contract) {
      try {
        const response = await this.contract.run({
          functionName: "getTransactions",
        });
        if (response.value.transactions) {
          this.pendingTxs = response.value.transactions;
        } else {
          this.pendingTxs = [];
        }
      } catch (error) {
        this.pendingTxs = [];
        throw new Error(error);
      }
    }
  }

  @Watch("address")
  async onChangeAddress() {
    this.pendingTxs = [];
    if (this.isValidAddress) {
      const account = this.getAccountByAddress(this.activeAccountAddress);
      if (account) {
        if (this.contract) {
          try {
            const response = await this.contract.run({
              functionName: "getCustodians",
            });
            if (
              response.value.custodians
                .map((custodian: any) => custodian.pubkey)
                .includes(`0x${account.publicKey}`)
            ) {
              this.isCustodian = true;
            } else {
              this.isCustodian = false;
            }
          } catch (error) {
            throw new Error(error);
          }
          await this.fetchPendingTxs();
        }
      }
    } else {
      this.isCustodian = false;
      this.pendingTxs = [];
    }
  }

  @Inject() showTypePasswordModal!: any;

  async confirmTx() {
    await this.showTypePasswordModal(this.activeAccountAddress).then(
      async (result: any) => {
        if (this.activeAccountAddress) {
          const account = this.getAccountByAddress(this.activeAccountAddress);
          if (account) {
            this.isPending = true;
            await Promise.all(
              this.selected.map(async ({ id }) => {
                const contract = new TonContract({
                  client: tonService.client,
                  address: this.address,
                  name: "safe-multisig",
                  tonPackage: contracts["safe-multisig"],
                });
                await contract.call({
                  functionName: "confirmTransaction",
                  input: {
                    transactionId: id,
                  },
                  keys: result.keypair,
                });
              })
            );
            this.isPending = false;
            this.$router.push("/");
          }
        }
      }
    );
  }
}
</script>

<style lang="sass">
.v-confirm-page
  &__table
    border: 1px solid #FFFFFF
    box-sizing: border-box
    border-radius: 5px
    background-color: #303540 !important
  & td,th
    padding: 0 8px !important
    border-bottom: none !important
</style>