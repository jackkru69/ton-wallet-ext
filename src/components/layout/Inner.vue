<template>
  <div class="v-inner">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Inner extends Vue {}
</script>

<style lang="sass" scoped>
.v-inner
  height: 100%
  padding: 0 30px
  box-sizing: border-box
  margin: 0 auto
  flex: 1 1
  max-width: 375px
  @media screen and (min-width: 375px)
    max-width: 1080px
</style>
