<template>
  <div fluid>
    <h1>FUND</h1>
    <a-input label="Address" v-model="address"></a-input>
    <a-button @click="fund" :disabled="address.length === 0"> FUND </a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { faucetClient } from "@/utils/client";
export default defineComponent({
  name: "AccountFund",
  setup() {
    const address = ref("");
    const fund = async () => {
      const res = await faucetClient.fundAccount(
        address.value,
        1000000000000000
      );
      console.log(res);
    };
    return {
      address,
      fund,
    };
  },
});
</script>

<style scoped></style>
