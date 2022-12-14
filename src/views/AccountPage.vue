<template>
  <div class="account-container">
    <h2>Account</h2>
    <div v-if="account" class="d-flex flex-column align-start pa-4">
      <h4 class="mt-6">Current Address</h4>
      <a-card min-width="400" class="mt-6">
        {{ address }}
        Balance: {{ userBalance }}
      </a-card>
      <a-row class="mt-6 pa-0">
        <a-col :span="8">
          <a-button @click="faucet" color="primary"> Faucet </a-button>
        </a-col>
        <a-col>
          <a-button @click="clear" color="error">Clear</a-button>
        </a-col>
      </a-row>
    </div>

    <div width="400" border class="pa-4 mt-6" v-else>
      <a-textarea
        placeholder="Input your private key "
        v-model="privateKey"
      ></a-textarea>
      <a-button @click="importAccount" color="primary"> Import </a-button>
      <a-button
        @click="createAccount"
        class="ml-6"
        color="primary"
        variant="outlined"
      >
        Generate
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { AptosAccount } from "aptos";
import { Buffer } from "buffer/";
import { useStore } from "vuex";
import { fetchUserBalance } from "@/utils/repository";
import { key } from "@/store";
import { faucetClient } from "@/utils/client";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "AccountPage",
  setup() {
    let privateKey = ref("");
    const store = useStore(key);
    const userBalance = ref(0);
    const router = useRouter();
    const route = useRoute();

    const createAccount = async () => {
      const account = new AptosAccount();
      privateKey.value = account.toPrivateKeyObject().privateKeyHex;
      await faucetClient.fundAccount(account.address(), 0);
      store.commit("updateAccount", account);
      await getUserBalance(account.address().toString());
      accountGenerated();
    };

    const importAccount = async () => {
      let pkey = privateKey.value;
      if (pkey.startsWith("0x")) {
        pkey = pkey.replace("0x", "");
      }
      const arr = Buffer.from(pkey, "hex");
      const account = new AptosAccount(arr);
      await faucetClient.fundAccount(account.address(), 0);
      store.commit("updateAccount", account);
      await getUserBalance(account.address().toString());
      accountGenerated();
    };

    const accountGenerated = () => {
      const redirect = route.query["redirect"];
      if (redirect) {
        router.push(`${redirect}`);
      }
    };

    const clear = () => {
      store.commit("clearAccount");
    };

    const faucet = async () => {
      if (store.state.account) {
        await faucetClient.fundAccount(store.state.account.address(), 10000);
        console.log(123);
        await fetchUserBalance(store.state.account.address());
        console.log(4567);
      }
    };

    const getUserBalance = async (address: string) => {
      const balance = await fetchUserBalance(address);
      if (balance) {
        userBalance.value = balance;
      }
    };

    onMounted(async () => {
      if (store.state.account) {
        await fetchUserBalance(store.state.account.address().toString());
      }
    });

    const pkey = localStorage.getItem("pkey");
    if (pkey) {
      privateKey.value = pkey;
      importAccount();
    }

    return {
      privateKey,
      createAccount,
      importAccount,
      faucet,
      clear,
      userBalance,
    };
  },
  data() {
    return {};
  },
  methods: {},
  computed: {
    account(): AptosAccount | null {
      return this.$store.state.account;
    },
    address() {
      if (this.$store.state.account) {
        return this.$store.state.account.address();
      } else {
        return "";
      }
    },
  },
});
</script>

<style scoped lang="scss">
.account-container {
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
