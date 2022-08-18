<template>
  <v-container fluid>
    <v-card>
      <v-card-title> Create collection </v-card-title>
      <v-row>
        <v-col cols="8">
          <v-card-item>
            <v-text-field hide-details label="Name" v-model="collectionName">
            </v-text-field>
            <v-text-field
              hide-details
              label="Description"
              v-model="collectionDesc"
            >
            </v-text-field>
            <v-text-field hide-details label="Uri" v-model="collectionUri">
            </v-text-field>
            <v-text-field
              type="number"
              hide-details
              label="Maximum"
              v-model="collectionMaxNum"
            >
            </v-text-field>
            <vue-json-pretty :data="collectionRes"> </vue-json-pretty>
            <v-btn
              @click="createCollection"
              :loading="collectionWaiting"
              class="mt-6"
              color="primary"
            >
              Create
            </v-btn>
          </v-card-item>
        </v-col>
        <v-col cols="4">
          <v-card-item>
            <v-img max-height="300" :src="collectionUri"></v-img>
          </v-card-item>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import VueJsonPretty from "vue-json-pretty";
import { defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { create_collection } from "@/utils/TokenRepository";
import { Transaction } from "aptos/dist/generated";
export default defineComponent({
  name: "NFTs",
  components: {
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
