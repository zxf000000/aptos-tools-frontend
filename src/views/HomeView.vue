<template>
  <a-layout style="width: 100vw; height: 100vh" has-sider>
    <a-layout-sider permanent v-model="showDrawer">
      <a-menu>
        <a-menu-item key="1" @click="$router.push('/fund')"> Fund </a-menu-item>
        <a-menu-item key="2" @click="$router.push('/module')">
          Module
        </a-menu-item>
        <a-menu-item key="3" @click="$router.push('/coin')"> Coin </a-menu-item>
        <a-menu-item key="4" @click="$router.push('/nft')"> NFT </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="app-bar">
        <div class="header-content">
          <h1 style="color: white">Aptos Tools</h1>
          <span class="mr-4"> Balance: {{ userBalance }} </span>
          <a-button
            :loading="funding"
            color="primary"
            class="mr-4"
            @click="fund"
          >
            FUND
          </a-button>
          <a-button color="error" class="mr-4"> CLEAR </a-button>
          <h6 style="color: white">address:: {{ address }}</h6>
        </div>
      </a-layout-header>
      <a-layout-content>
        <router-view />
      </a-layout-content>
      <a-layout-footer>footer</a-layout-footer>
    </a-layout>
  </a-layout>
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
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: #fff;
  height: 100%;
}
</style>
