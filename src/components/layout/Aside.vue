<template>
  <VNavigationDrawer app clipped :value="isOpen">
    <v-list expand>
      <v-list-item link :to="`/`">
        <v-list-item-title>Main page</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="`/providers`">
        <v-list-item-title>Providers</v-list-item-title>
      </v-list-item>
    </v-list>
  </VNavigationDrawer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Aside extends Vue {
  @Prop() isOpen: boolean;
}
</script>
