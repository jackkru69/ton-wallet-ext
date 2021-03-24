<template>
  <div class="v-initialize-page py-8">
    <Inner>2</Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard } from "vuetify/lib";

@Component({
  components: { Inner, VCard },
})
export default class InitializePage extends Vue {}
</script>

<style lang="sass" scoped>
.v-initialize-page
</style>