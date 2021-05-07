<template>
  <VDialog light v-model="isOpen" persistent max-width="325px">
    <VCard>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="resolvePromise"
      >
        <VCardTitle>
          <h3>Deploy?</h3>
        </VCardTitle>
        <v-card-text> </v-card-text>
        <v-card-actions>
          <VSpacer></VSpacer>
          <VBtn x-small text @click="rejectPromise"> No </VBtn>
          <VBtn x-small :loading="isPending" text type="submit"> Yes </VBtn>
        </v-card-actions>
      </VForm>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { tonService } from "@/background";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { Component, Vue } from "vue-property-decorator";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkServer",
    ]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["deploy"]),
  },
});

@Component
export default class DeployModal extends Mappers {
  valid = true;
  isOpen = false;

  isPending = false;

  resolvePromise: any = null;
  rejectPromise: any = null;

  onClickDeploy(result: any) {
    return new Promise((resolve, reject) => {
      this.isOpen = true;

      this.resolvePromise = async () => {
        try {
          this.isPending = true;
          await this.deploy({
            address: this.activeAccountAddress,
            client: tonService.client,
            symbol: "TON",
            networkServer: this.activeNetworkServer,
            keypair: result.keypair,
          });
          this.isPending = false;

          this.isOpen = false;
          resolve(true);
        } catch (error) {
          this.isPending = false;
          reject(false);
        }
      };

      this.rejectPromise = () => {
        reject(false);
        this.isOpen = false;
      };
    });
  }
}
</script>
