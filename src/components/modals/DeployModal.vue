<template>
  <VDialog v-model="isOpen" persistent max-width="325px">
    <VCard>
      <VCardTitle>
        <h3>Deploy?</h3>
      </VCardTitle>
      <v-card-text> </v-card-text>
      <v-card-actions>
        <VSpacer></VSpacer>
        <VBtn text @click="rejectPromise"> Nope </VBtn>
        <VBtn :loading="isPending" text @click="resolvePromise"> Yeeees </VBtn>
      </v-card-actions>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { tonService } from "@/background";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { Component, VModel, Vue } from "vue-property-decorator";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters([
      "activeAccountAddress",
      "activeNetworkID",
    ]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["deploy"]),
  },
});

@Component
export default class DeployModal extends Mappers {
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
            networkId: this.activeNetworkID,
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
