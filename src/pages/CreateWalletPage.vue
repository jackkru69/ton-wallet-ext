<template>
  <div class="v-create-wallet-page py-8">
    <Inner>
      <h1 class="mb-8">Create wallet</h1>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard, VIcon } from "vuetify/lib";
import { tonService } from "@/standalone/main";
@Component({
  components: { Inner, VCard, VIcon },
})
export default class CreateWalletPage extends Vue {
  created() {
    console.log(tonService);
  }
}
</script>

<style lang="sass" scoped>
.v-create-wallet-page
</style>