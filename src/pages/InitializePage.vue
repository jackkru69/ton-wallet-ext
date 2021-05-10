<template>
  <div class="v-initialize-page py-8">
    <Inner>
      <h1 class="text-center mb-8">Create or restore account</h1>
      <div class="v-initialize-page d-flex justify-center align-center">
        <VCard
          hover
          link
          to="/easy-add"
          width="300"
          class="mr-4 pa-4 d-flex flex-column align-center justify-center"
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

@Component({
  components: { Inner },
})
export default class InitializePage extends Vue {}
</script>

