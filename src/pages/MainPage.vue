<template>
  <div class="v-main-page py-8">
    <Inner> </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { VCard } from "vuetify/lib";

@Component({
  components: { Inner, VCard },
  // methods: { isEmpty },
})
export default class MainPage extends Vue {}
</script>

<style lang="sass" scoped>
.v-main-page
</style>