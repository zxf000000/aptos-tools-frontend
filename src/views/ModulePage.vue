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
  </v-container>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { AptosClient, HexString, TxnBuilderTypes } from "aptos";
import { aptosClient } from "@/utils/client";
import router from "@/router";

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
      router.push("/account");
    }

    const publishModule = async (text: string) => {
      if (store.state.account) {
        const account = store.state.account;
        console.log("text", text);
        const code = new HexString(text).toUint8Array();
        console.log(code);
        const module = new TxnBuilderTypes.Module(code);

        const moduleBundlePayload =
          new TxnBuilderTypes.TransactionPayloadModuleBundle(
            new TxnBuilderTypes.ModuleBundle([module])
          );
        const [{ sequence_number: sequenceNumber }, chainId] =
          await Promise.all([
            aptosClient.getAccount(account.address()),
            aptosClient.getChainId(),
          ]);

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
        let u = new Uint8Array(event.target.result as ArrayBuffer);
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

    return {
      buildFile,
      tapPublish,
      publishModule,
      loading,
      publishTxHex,
    };
  },
});
</script>

<style scoped></style>
