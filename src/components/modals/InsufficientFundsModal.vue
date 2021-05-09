<template>
  <VDialog light v-model="model" max-width="325px">
    <VCard>
      <VCardTitle>
        <h3>Insufficient funds</h3> </VCardTitle
      ><VCardText
        >You do not have the required funds available in your
        account.</VCardText
      >
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { Component, VModel, Vue } from "vue-property-decorator";

@Component
export default class InsufficientFundsModal extends Vue {
  @VModel() model: boolean;
}
</script>
