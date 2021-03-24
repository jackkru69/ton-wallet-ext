<template>
  <div class="v-popup">
    <PopupLayout />
  </div>
</template>

<script>
import PopupLayout from "@/components/layout/PopupLayout.vue";
export default {
  name: "App",
  components: { PopupLayout },
};
</script>

<style>
html {
  width: 357px;
  height: 600px;
}
</style>
