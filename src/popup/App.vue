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
  provide: { isPopup: true },
};
</script>

<style lang="sass">
html, body
  width: 357px
  height: 600px
</style>


