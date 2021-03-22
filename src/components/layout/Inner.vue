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
  padding: 0 8px
  max-width: 320px
  padding: 0 32px

  box-sizing: border-box
  margin: 0 auto
  flex: 1 1
  @media screen and (min-width: 375px)
    max-width: 375px
  @media screen and (min-width: 768px)
    padding: 0 16px
    max-width: 1080px
  @media screen and (min-width: 1280px)
    max-width: 1080px
  @media screen and (min-width: 1440px)
    max-width: 1240px

  &._fullscreen1920
    @media screen and (min-width: 1920px)
      max-width: 1720px
  &._fullscreen
    max-width: 100%!important
</style>
