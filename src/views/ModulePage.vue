<template>
  <v-container fluid>
    <h2>Module</h2>
    <v-card class="mt-6 elevation-3 pa-4">
      <v-card-title> Publish </v-card-title>
      <v-card-item>
        Address: {{ $store.state.account?.address() }}
      </v-card-item>
      <v-card-item>
        <v-file-input
          hide-details
          v-model="buildFile"
          density="compact"
          label="module build file(.mv)"
        >
        </v-file-input>
      </v-card-item>
      <v-card-actions>
        <v-btn
          :loading="loading"
          @click="tapPublish"
          class="mt-4"
          color="primary"
        >
          Publish
        </v-btn>
      </v-card-actions>
      <v-divider> </v-divider>
      <v-card-item>
        <h5>Tx Hex:</h5>
        <a
          target="_blank"
          :href="'https://explorer.devnet.aptos.dev/txn/' + publishTxHex"
        >
          <span>{{ publishTxHex }}</span>
        </a>
      </v-card-item>
    </v-card>
    <v-card elevation="4" class="mt-6">
      <v-card-title> Execute Function </v-card-title>
      <v-card-text>
        <v-text-field
          label="Module name"
          density="compact"
          class="mt-6"
          hide-details
          v-model="moduleName"
        ></v-text-field>
        <v-text-field
          density="compact"
          hide-details
          class="mt-6"
          label="Function name"
          v-model="funName"
        >
        </v-text-field>
        <v-text-field
          density="compact"
          hide-details
          class="mt-6"
          label="Function args (split by `,`)"
          v-model="funcArgs"
        >
        </v-text-field>
        <v-btn
          :loading="exeFuncLoading"
          class="mt-6"
          color="primary"
          @click="executeFunc"
        >
          Execute
        </v-btn>
      </v-card-text>
      <v-card-text>
        <span>
          Result:
          <a
            target="_blank"
            :href="'https://explorer.devnet.aptos.dev/txn/' + funcRes"
          >
            {{ funcRes }}
          </a>
        </span>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { AptosClient, HexString, TxnBuilderTypes } from "aptos";
import { aptosClient } from "@/utils/client";
import {
  executeFunction,
  fetchModules,
  getSequenceNumberAndChainId,
} from "@/utils/repository";

export default defineComponent({
  name: "ModulePage",
  setup() {
    const store = useStore(key);
    const address = ref("");
    const buildFile: Ref<FileList | Array<File>> = ref([]);
    const loading = ref(false);
    const publishTxHex = ref("");
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
        const { sequenceNumber, chainId } = await getSequenceNumberAndChainId(
          account
        );
        const rawTransaction = new TxnBuilderTypes.RawTransaction(
          TxnBuilderTypes.AccountAddress.fromHex(account.address()),
          BigInt(sequenceNumber),
          moduleBundlePayload,
          1000n,
          1n,
          BigInt(Math.floor(Date.now() / 1000) + 10),
          new TxnBuilderTypes.ChainId(chainId)
        );

        console.log(rawTransaction);

        const bcsTxn = AptosClient.generateBCSTransaction(
          account,
          rawTransaction
        );
        const result = await aptosClient.submitSignedBCSTransaction(bcsTxn);
        console.log(result);
        publishTxHex.value = result.hash;
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
