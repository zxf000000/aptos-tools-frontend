<template>
  <div style="padding: 0 0 40px 0">
    <a-card>
      <template #title> Create collection </template>
      <a-row :gutter="20">
        <a-col cols="8">
          <a-input placeholder="Name" v-model:value="collectionName"> </a-input>
          <a-input placeholder="Description" v-model:value="collectionDesc">
          </a-input>
          <a-input placeholder="Uri" v-model:value="collectionUri"></a-input>
          <a-input
            type="number"
            placeholder="Maximum"
            v-model:value="collectionMaxNum"
          >
          </a-input>
        </a-col>
        <a-col :span="4">
          <a-image :width="300" :src="collectionUri"></a-image>
        </a-col>
      </a-row>
      <vue-json-pretty :data="collectionRes"> </vue-json-pretty>
      <a-button
        @click="createCollection"
        :loading="collectionWaiting"
        class="mt-6"
        color="primary"
      >
        Create
      </a-button>
    </a-card>
    <create-token> </create-token>
    <modify-token></modify-token>
  </div>
</template>

<script lang="ts">
import VueJsonPretty from "vue-json-pretty";
import { defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import {
  create_collection,
  fetchCollections,
  fetchToken,
  fetchTokens,
} from "@/utils/TokenRepository";
import { Transaction } from "aptos/dist/generated";
import CreateToken from "@/components/CreateToken.vue";
import ModifyToken from "@/components/ModifyToken.vue";
export default defineComponent({
  name: "NFTs",
  components: {
    ModifyToken,
    CreateToken,
    VueJsonPretty,
  },
  setup() {
    const collectionName = ref("");
    const collectionDesc = ref("");
    const collectionUri = ref("");
    const collectionMaxNum = ref("");
    const store = useStore(key);
    const collectionWaiting = ref(false);
    const collectionRes: Ref<Transaction | null> = ref(null);
    const createCollection = async () => {
      if (store.state.account) {
        collectionWaiting.value = true;
        try {
          const res = await create_collection(
            store.state.account,
            collectionName.value,
            collectionDesc.value,
            collectionUri.value,
            parseInt(collectionMaxNum.value)
          );
          console.log(res);
          collectionRes.value = res;
          collectionWaiting.value = false;
        } catch (e: any) {
          collectionRes.value = e.message;
        }
      }
    };

    // fetchTokens(
    //   "0x5da4403978effabe5ec7a09054f610bd07500acbf5e86024da9e6e42d48e22d1"
    // ).then((res) => {
    //   console.log(res);
    // });
    //
    // fetchCollections(
    //   "0x86fe68c2060f6ae2f422fc87031137cf84cd4e8b7deae8c203867967752a2dba"
    // ).then((res) => {
    //   console.log("collections ", res);
    // });
    //
    // fetchToken(
    //   "0x86fe68c2060f6ae2f422fc87031137cf84cd4e8b7deae8c203867967752a2dba",
    //   "Topaz Kittens",
    //   "Topaz Kitten 736"
    // ).then((res) => {
    //   console.log("token ", res);
    // });
    return {
      collectionWaiting,
      createCollection,
      collectionName,
      collectionDesc,
      collectionUri,
      collectionMaxNum,
      collectionRes,
    };
  },
});
</script>

<style scoped lang="scss"></style>
