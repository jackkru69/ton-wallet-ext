<template>
  <v-app-bar class="v-app-bar" app clipped-left short>
    <v-app-bar-title>TON wallet ext</v-app-bar-title>
  </v-app-bar>
</template>


  <script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { VBtn } from "vuetify/lib";
import { rootModuleMapper } from "@/store/root";

const Mappers = Vue.extend({
  computed: {
    ...rootModuleMapper.mapGetters([]),
  },
  methods: { ...rootModuleMapper.mapActions([]) },
});

@Component({ components: { VBtn } })
export default class Header extends Mappers {}
</script>
