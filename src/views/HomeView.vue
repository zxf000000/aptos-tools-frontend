<template>
  <v-app>
    <v-app-bar class="app-bar" app elevate-on-scroll>
      <v-app-bar-title> Aptos Tools </v-app-bar-title>
      <v-spacer> </v-spacer>
      <h6>address:: {{ address }}</h6>
    </v-app-bar>
    <v-navigation-drawer permanent v-model="showDrawer">
      <v-list>
        <v-list-item to="/module"> Module </v-list-item>
        <v-list-item to="/coin"> Coin </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { importAccount } from "@/utils/repository";

export default defineComponent({
  name: "HomeView",
  setup() {
    console.log(123);
    const store = useStore(key);
    const pkey = localStorage.getItem("pkey");
    onMounted(async () => {
      if (pkey) {
        const account = await importAccount(pkey);
        console.log(pkey);
        store.commit("updateAccount", account);
      }
    });
  },
  data() {
    return {
      showDrawer: true,
    };
  },
  computed: {
    address() {
      if (this.$store.state.account) {
        return this.$store.state.account.address().toString();
      } else {
        return "";
      }
    },
  },
});
</script>

<style lang="scss">
.app-bar {
  padding: 0 20px;
}
</style>
