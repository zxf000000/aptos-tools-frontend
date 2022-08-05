<template>
  <v-container fluid class="d-flex flex-column align-start">
    <h2>Account</h2>
    <v-sheet v-if="account" class="d-flex flex-column align-start pa-4">
      <h4 class="mt-6">Current Address</h4>
      <v-card min-width="400" class="mt-6">
        <v-card-text>
          {{ address }}
        </v-card-text>
        <v-card-text> Balance: {{ userBalance }} </v-card-text>
      </v-card>
      <v-row class="mt-6 pa-0">
        <v-col>
          <v-btn @click="faucet" color="primary"> Faucet </v-btn>
        </v-col>
        <v-col>
          <v-btn @click="clear" color="error">Clear</v-btn>
        </v-col>
      </v-row>
    </v-sheet>

    <v-sheet width="400" border class="pa-4 mt-6" v-else>
      <v-textarea
        placeholder="Input your private key "
        v-model="privateKey"
      ></v-textarea>
      <v-btn @click="importAccount" color="primary"> Import </v-btn>
      <v-btn
        @click="createAccount"
        class="ml-6"
        color="primary"
        variant="outlined"
      >
        Generate
      </v-btn>
    </v-sheet>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { AptosAccount } from "aptos";
import { Buffer } from "buffer/";
import { useStore } from "vuex";
import { fetchUserBalance } from "@/utils/repository";
import { key } from "@/store";
import { faucetClient } from "@/utils/client";

export default defineComponent({
  name: "AccountPage",
  setup() {
    let privateKey = ref("");
    const store = useStore(key);
    const userBalance = ref(0);

    const createAccount = async () => {
      const account = new AptosAccount();
      privateKey.value = account.toPrivateKeyObject().privateKeyHex;
      await faucetClient.fundAccount(account.address(), 0);
      store.commit("updateAccount", account);
      await getUserBalance(account.address().toString());
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

<style scoped lang="scss"></style>
