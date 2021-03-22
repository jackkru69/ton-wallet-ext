<template>
  <div class="mt-4">
    <VTextField label="Text" clearable solo hide-details></VTextField>
  </div>
</template>

<script>
import { VTextField } from "vuetify/lib";

export default {
  name: "App",
  components: { VTextField },
};
</script>

<style>
html {
  width: 400px;
  height: 400px;
  padding: 16px;
}
</style>
