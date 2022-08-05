<template>
  <v-app>
    <v-app-bar class="app-bar" app elevate-on-scroll>
      <v-app-bar-title> Aptos Tools </v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer permanent v-model="showDrawer">
      <v-list>
        <v-list-item to="/account"> Account </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  data() {
    return {
      showDrawer: true,
    };
  },
});
</script>

<style lang="scss">
.app-bar {
  padding: 0 0 0 200px;
}
</style>
