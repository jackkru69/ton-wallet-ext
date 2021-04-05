<template>
  <div class="v-restore-wallet-page py-8">
    <Inner>
      <h1 class="mb-8">Restore wallet</h1>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard, VIcon } from "vuetify/lib";

@Component({
  components: { Inner, VCard, VIcon },
})
export default class RestoreWalletPage extends Vue {}
</script>

