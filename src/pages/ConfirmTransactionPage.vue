<template>
  <div class="v-confirm-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="confirmTx"
      >
        <h1 class="mb-8">Confirm transaction</h1>
        <VTextField
          class="mb-4"
          v-model="address"
          clearable
          outlined
          label="Address"
          :rules="[(v) => !!v || 'Address is required']"
        ></VTextField>

        <VDataTable
          v-if="address && isCustodian === true"
          v-model="selected"
          :loading="isTxsPending"
          :headers="headersPendingTxs"
          :items="fPendingTxs"
          :items-per-page="5"
          disable-pagination
          hide-default-footer
          item-key="id"
          show-select
          class="mb-4"
        >
        </VDataTable>
        <div class="d-flex justify-end">
          <VBtn to="/" class="mr-4"> Back </VBtn>
          <VBtn
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
import { Promise } from "core-js";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeAccountAddress"]),
    ...accountsModuleMapper.mapGetters(["getAccountByAddress"]),
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

  isCustodian: any = null;

  selected = [];

  isTxsPending = false;
  isPending = false;

  address = "";

  pendingTxs = [];

  headersPendingTxs = [
    {
      text: "ID",
      value: "fId",
      sortable: false,
    },
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
      text: "signsReceived",
      value: "signsReceived",
      sortable: false,
    },
    {
      text: "signsRequired",
      value: "signsRequired",
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

  public get contract() {
    if (this.address)
      return new TonContract({
        client: tonService.client,
        address: this.address,
        name: "safe-multisig",
        tonPackage: contracts["safe-multisig"],
      });
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
        }
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  @Watch("address")
  async onChangeAddress(address: string) {
    if (address) {
      const account = this.getAccountByAddress(address);
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
            }
          } catch (error) {
            throw new Error(error);
          }
          await this.fetchPendingTxs();
        }
      }
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

