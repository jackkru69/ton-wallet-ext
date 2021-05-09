<template>
  <div
    class="v-inner"
    :class="{
      _fullscreen1920: type === 'fullscreen1920',
      _fullscreen: type === 'fullscreen',
    }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Inner extends Vue {
  @Prop() type?: "fullscreen1920" | "fullscreen";
}
</script>

<style lang="sass" scoped>
.v-inner
  height: 100%
  padding: 0 30px
  box-sizing: border-box
  margin: 0 auto
  flex: 1 1
  @media screen and (min-width: 375px)
    max-width: 375px
  @media screen and (min-width: 768px)
    max-width: 1080px
</style>
