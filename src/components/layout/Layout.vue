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

@Component({
  components: { Aside, Header },
})
export default class Layout extends Vue {}
</script>

