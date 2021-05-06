<template>
  <div class="v-popup">
    <Layout />
  </div>
</template>

<script>
import Layout from "@/components/layout/Layout.vue";
export default {
  name: "App",
  components: { Layout },
};
</script>

<style lang="sass">
html, body
  width: 357px
  height: 600px
  // /* this will hide the scrollbar in mozilla based browsers */
  // overflow: -moz-scrollbars-none
  // /* this will hide the scrollbar in internet explorers */
  // -ms-overflow-style: none
  // &::-webkit-scrollbar
  //   display: none !important
// body
//   &::-webkit-scrollbar
//     display: none !important
</style>


