<template>
  <div class="v-initialize-page py-8">
    <Inner>
      <h1 class="text-center mb-8">Create or restore wallet</h1>
      <div class="v-initialize-page d-flex justify-center align-center">
        <VCard
          hover
          width="300"
          class="mr-4 pa-4 d-flex flex-column align-center justify-center"
          @click="onClickEasyAdd"
        >
          <VIcon class="mb-4" size="40">mdi-plus</VIcon>
          <h2>Easy Add</h2>
        </VCard>
        <VCard
          hover
          link
          to="/initialize/create"
          width="300"
          class="mr-4 pa-4 d-flex flex-column align-center justify-center"
        >
          <VIcon class="mb-4" size="40">mdi-plus</VIcon>
          <h2>Add</h2>
        </VCard>
        <VCard
          hover
          link
          to="/initialize/restore"
          width="300"
          class="pa-4 d-flex flex-column align-center justify-center"
        >
          <VIcon class="mb-4" size="40">mdi-restore</VIcon>
          <h2>Restore</h2>
        </VCard>
      </div>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { tonService } from "@/background";
import { convertSeedToKeyPair, generateSeed } from "@/ton/ton.utils";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { rootModuleMapper } from "@/store/root";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters(["activeNetworkID"]),
    ...accountsModuleMapper.mapGetters(["accountsCount"]),
  },
  methods: {
    ...accountsModuleMapper.mapActions(["addAccount"]),
    ...accountsModuleMapper.mapMutations(["addNetworkToToken"]),
    ...rootModuleMapper.mapMutations(["setActiveAccountID"]),
  },
});

@Component({
  components: { Inner },
})
export default class InitializePage extends Mappers {
  async onClickEasyAdd() {
    const seedPhrase: any = await generateSeed(tonService.client, 12);
    const keypair = await convertSeedToKeyPair(
      tonService.client,
      seedPhrase?.phrase,
      12
    );
    const { activeNetworkID, accountsCount } = this;
    await this.addAccount({
      keypair,
      custodians: [`0x${keypair.public}`],
      walletType: "set-code-multisig2",
      activeNetworkID,
      name: `Account ${accountsCount + 1}`,
      numberOfCustodians: 1,
      client: tonService.client,
    });
    this.setActiveAccountID(accountsCount);
    this.$router.push("/");
  }
}
</script>

