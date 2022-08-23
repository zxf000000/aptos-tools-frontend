<template>
  <div>
    <h2>Module</h2>
    <a-card class="mt-6 elevation-3 pa-4">
      <template #title> Publish </template>
      Address: {{ $store.state.account?.address() }}
      <a-input
        v-model:value="buildFile"
        type="file"
        placeholder="module build file(.mv)"
      >
      </a-input>
      <template #actions>
        <a-button
          :loading="loading"
          @click="tapPublish"
          class="mt-4"
          color="primary"
        >
          Publish
        </a-button>
      </template>
      <h5>Tx Hex:</h5>
      <a
        target="_blank"
        :href="'https://explorer.devnet.aptos.dev/txn/' + publishTxHex"
      >
        <span>{{ publishTxHex }}</span>
      </a>
      <vue-json-pretty :data="publishResult"></vue-json-pretty>
    </a-card>
    <a-card elevation="4" class="mt-6">
      <template #title> Execute Function </template>
      <a-input
        label="Module name"
        density="compact"
        class="mt-6"
        hide-details
        v-model="moduleName"
      ></a-input>
      <a-input
        density="compact"
        hide-details
        class="mt-6"
        label="Function name"
        v-model="funName"
      >
      </a-input>
      <a-input
        density="compact"
        hide-details
        class="mt-6"
        label="Function args (split by `,`)"
        v-model="funcArgs"
      >
      </a-input>
      <a-button
        :loading="exeFuncLoading"
        class="mt-6"
        color="primary"
        @click="executeFunc"
      >
        Execute
      </a-button>
      <span>
        Result:
        <a
          target="_blank"
          :href="'https://explorer.devnet.aptos.dev/txn/' + funcRes"
        >
          {{ funcRes }}
        </a>
      </span>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { AptosClient, HexString, TxnBuilderTypes } from "aptos";
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

import {
  executeFunction,
  executeTransactionWithPayload,
  fetchModules,
} from "@/utils/repository";
import { Transaction } from "aptos/dist/generated";

export default defineComponent({
  name: "ModulePage",
  components: {
    VueJsonPretty,
  },
  setup() {
    const store = useStore(key);
    const address = ref("");
    const buildFile: Ref<FileList | Array<File>> = ref([]);
    const loading = ref(false);
    const publishTxHex = ref("");
    const publishResult: Ref<Transaction | null> = ref(null);
    if (store.state.account) {
      address.value = store.state.account.address().toString();
    } else {
      // router.push("/account");
    }

    const publishModule = async (text: string) => {
      if (store.state.account) {
        const account = store.state.account;
        const code = new HexString(text).toUint8Array();
        const module = new TxnBuilderTypes.Module(code);

        const moduleBundlePayload =
          new TxnBuilderTypes.TransactionPayloadModuleBundle(
            new TxnBuilderTypes.ModuleBundle([module])
          );
        const res = await executeTransactionWithPayload(
          account,
          moduleBundlePayload
        );
        publishResult.value = res;
        console.log(res);
        publishTxHex.value = res.hash;
        loading.value = false;
      }
    };

    const tapPublish = () => {
      console.log(buildFile.value);
      const fileReader = new FileReader();
      fileReader.addEventListener("load", (event) => {
        let u: Uint8Array | null = new Uint8Array(
          event.target?.result as ArrayBuffer
        );
        const a = new Array(u.length);
        let i = u.length;
        while (i--) {
          // map to hex
          a[i] = (u[i] < 16 ? "0" : "") + u[i].toString(16);
        }
        u = null; // free memory
        publishModule("0x" + a.join(""));
      });
      if (buildFile.value) {
        loading.value = true;
        fileReader.readAsArrayBuffer(buildFile.value[0]);
      }
    };

    const moduleName = ref("");
    const funName = ref("");
    const funcArgs = ref("");
    const funcRes = ref("");
    const exeFuncLoading = ref(false);

    const executeFunc = async () => {
      if (!store.state.account) {
        return;
      }
      exeFuncLoading.value = true;
      const account = store.state.account;
      const args = funcArgs.value.split(",");
      const res = await executeFunction(
        account,
        moduleName.value,
        funName.value,
        args
      );
      exeFuncLoading.value = false;
      funcRes.value = res.hash;
    };

    return {
      buildFile,
      tapPublish,
      publishModule,
      loading,
      publishTxHex,
      moduleName,
      funName,
      funcArgs,
      executeFunc,
      exeFuncLoading,
      funcRes,
      publishResult,
    };
  },
  computed: {
    account() {
      return this.$store.state.account;
    },
  },
  watch: {
    async account(newVal) {
      await fetchModules(newVal);
    },
  },
});
</script>

<style scoped></style>
