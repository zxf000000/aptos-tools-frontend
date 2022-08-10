<template>
  <v-app>
    <v-app-bar class="app-bar" app elevate-on-scroll>
      <v-app-bar-title> Aptos Tools </v-app-bar-title>
      <v-spacer> </v-spacer>
      <span class="mr-4"> Balance: {{ userBalance }} </span>
      <v-btn :loading="funding" color="primary" class="mr-4" @click="fund">
        FUND
      </v-btn>
      <v-btn color="error" class="mr-4"> CLEAR </v-btn>
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
import { defineComponent, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { fetchUserBalance, importAccount } from "@/utils/repository";
import { faucetClient } from "@/utils/client";

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
    const funding = ref(false);
    const fund = async () => {
      if (store.state.account) {
        funding.value = true;
        try {
          const res = await faucetClient.fundAccount(
            store.state.account.address(),
            1000
          );
          funding.value = false;
          console.log(res);
          getUserBalance();
        } catch (e) {
          console.error(e);
          getUserBalance();
        }
      }
    };
    const userBalance = ref(0);
    const getUserBalance = async () => {
      if (store.state.account) {
        const balance = await fetchUserBalance(store.state.account.address());
        if (balance) {
          userBalance.value = balance;
        }
      }
    };
    const clearAccount = () => {
      store.commit("clearAccount");
    };
    return {
      funding,
      fund,
      clearAccount,
      getUserBalance,
      userBalance,
    };
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
  watch: {
    "$store.state.account": async function () {
      this.getUserBalance();
    },
  },
});
</script>

<style lang="scss">
.app-bar {
  padding: 0 20px;
}
</style>
