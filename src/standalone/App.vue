<template>
  <layout></layout>
</template>

<script lang="ts">
import Layout from "@/components/layout/Layout.vue";

export default {
  name: "App",
  components: {
    Layout,
  },
  provide: { isPopup: false },
};
</script>