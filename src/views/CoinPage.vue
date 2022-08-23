<template>
  <div fluid>
    <h1>Coin</h1>
    <a-card elevation="4" class="mt-6">
      <template #title> Initialize Coin </template>
      <a-autocomplete
        label="Select Coin Module"
        :items="modules"
        :loading="loading"
        v-model="selectedModule"
        item-title="abi.name"
        item-value="abi"
        hide-details
      >
      </a-autocomplete>
      <a-autocomplete
        hide-details
        label="Select struct"
        :disabled="!selectedModule"
        :items="selectedModule ? selectedModule.structs : []"
        item-title="name"
        v-model="selectedStruct"
      >
      </a-autocomplete>
      <a-input
        density="compact"
        v-model="coinName"
        label="Coin Name"
        hide-details
      >
      </a-input>
      <a-input
        density="compact"
        label="Coin Symbol"
        v-model="coinSymbol"
        hide-details
      >
      </a-input>
      <a-button
        :loading="initializeLoading"
        color="primary"
        @click="tapInitializeCoin"
      >
        Initialize
      </a-button>
      <h6>Result: {{ initializeHash }}</h6>
      <VueJsonPretty :data="initializeResult"> </VueJsonPretty>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { aptosClient } from "@/utils/client";
import { MoveModuleBytecode, Transaction } from "aptos/dist/generated";
import { initializeCoin } from "@/utils/repository";
import VueJsonPretty from "vue-json-pretty";
import { MoveModule } from "aptos/src/generated/models/MoveModule";
export default defineComponent({
  name: "CoinPage",
  components: {
    VueJsonPretty,
  },
  setup() {
    const store = useStore(key);
    const account = ref(store.state.account);
    const moduleName = ref("");
    const modules = ref(Array<MoveModuleBytecode>());
    const loading = ref(false);
    const selectedStruct = ref("");
    const selectedModule: Ref<MoveModule | null> = ref(null);
    const initializeResult: Ref<Transaction | null> = ref(null);
    const initializeLoading = ref(false);
    const initializeHash = ref("");
    const coinName = ref("");
    const coinSymbol = ref("");
    const fetchUserModules = async () => {
      if (account.value) {
        loading.value = true;
        modules.value = await aptosClient.getAccountModules(
          account.value.address()
        );
        console.log(modules.value);
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchUserModules();
    });

    const tapInitializeCoin = async () => {
      if (store.state.account) {
        initializeLoading.value = true;
        const address = store.state.account.address();
        const moduleName = selectedModule.value
          ? selectedModule.value.name
          : "";
        const res = await initializeCoin(
          store.state.account,
          address,
          moduleName || "",
          selectedStruct.value || "",
          coinName.value,
          coinSymbol.value
        );
        initializeLoading.value = false;
        initializeResult.value = res;
        initializeHash.value = res.hash;
      }
    };

    return {
      account,
      moduleName,
      modules,
      loading,
      selectedModule,
      fetchUserModules,
      tapInitializeCoin,
      selectedStruct,
      initializeLoading,
      initializeResult,
      coinName,
      coinSymbol,
      initializeHash,
    };
  },
  computed: {
    userAccount() {
      return this.$store.state.account;
    },
  },
  watch: {
    account() {
      this.fetchUserModules();
    },
  },
});
</script>

<style scoped></style>
