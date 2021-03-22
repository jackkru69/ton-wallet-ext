<template>
  <v-app-bar class="v-app-bar" app clipped-left short>
    <v-app-bar-title>FTE Admin Panel</v-app-bar-title>
    <v-spacer></v-spacer>
    <VSwitch
      hide-details
      v-model="$vuetify.theme.dark"
      inset
      label="Dark theme"
    ></VSwitch>
  </v-app-bar>
</template>


  <script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { VSwitch, VBtn } from "vuetify/lib";
import { rootModuleMapper } from "@/store/root";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters([]),
  },
  methods: { ...rootModuleMapper.mapActions([]) },
});

@Component({ components: { VSwitch, VBtn } })
export default class Header extends Mappers {}
</script>
