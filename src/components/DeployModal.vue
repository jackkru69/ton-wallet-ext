<template>
  <VDialog v-model="model" persistent max-width="325px">
    <VCard>
      <VCardTitle>
        <h3>Deploy?</h3>
      </VCardTitle>
      <v-card-text> </v-card-text>
      <v-card-actions>
        <VSpacer></VSpacer>
        <VBtn text @click="model = false"> Nope </VBtn>
        <VBtn :loading="isPending" text @click="onClickDeploy"> Yeeees </VBtn>
      </v-card-actions>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { tonService } from "@/background";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { rootModuleMapper } from "@/store/root";
import { Component, VModel, Vue } from "vue-property-decorator";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters(["activeAccountID", "activeNetworkID"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["deploy"]),
  },
});

@Component
export default class DeployModal extends Mappers {
  @VModel() model: boolean;

  isPending = false;

  async onClickDeploy() {
    try {
      this.isPending = true;
      await this.deploy({
        id: this.activeAccountID,
        client: tonService.client,
        tokenId: 0,
      });
      this.isPending = false;
      this.model = false;
    } catch (error) {
      this.isPending = false;
      console.error(error);
      throw new Error(error);
    }
  }
}
</script>
