<template>
  <v-app>
    <Header />
    <v-main>
      <v-container fluid class="pa-0">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Aside from "@/components/layout/Aside.vue";
import Header from "@/components/layout/Header.vue";
import { VTextField, VBtn, VOverlay } from "vuetify/lib";

@Component({
  components: { Aside, Header, VTextField, VBtn, VOverlay },
})
export default class Layout extends Vue {}
</script>

