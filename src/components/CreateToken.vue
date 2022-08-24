<template>
  <a-card class="mt-6 create-card">
    <template #title>
      Create Token
      <a-button @click="tapFetch">
        <reload-outlined />
      </a-button>
    </template>
    <a-row>
      <a-col :span="8">
        <collection-selection
          v-model:selected-collection="selectedCollection"
        ></collection-selection>
        <a-input
          placeholder="token name"
          v-model:value="tokenName"
          hide-details
        >
        </a-input>
        <a-input
          placeholder="token description"
          v-model="tokenDesc"
          hide-details
        >
        </a-input>
        <a-input placeholder="token uri" v-model:value="tokenUri" hide-details>
        </a-input>
        <a-input
          placeholder="token balance"
          v-model:value="tokenBalance"
          type="number"
          hide-details
        >
        </a-input>
        <a-input
          placeholder="token maximum"
          v-model:value="tokenMaximum"
          type="number"
          hide-details
        >
        </a-input>
        <a-input
          placeholder="royalty denominator"
          v-model:value="royaltyDenominator"
          type="number"
          hide-details
        >
        </a-input>
        <a-input
          placeholder="royalty numerator"
          v-model:value="royaltyNumerator"
          type="number"
          hide-details
        >
        </a-input>
      </a-col>
      <a-col :span="4">
        <a-image :src="tokenUri" max-height="300"> </a-image>
      </a-col>
    </a-row>
    Result:
    <vue-json-pretty :data="tokenResult"> </vue-json-pretty>
    <a-button
      :loading="creatingToken"
      color="primary"
      class="mt-6"
      @click="tapCreate"
    >
      CREATE
    </a-button>
  </a-card>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { create_token, fetchCollections } from "@/utils/TokenRepository";
import { Event, Transaction } from "aptos/dist/generated";
import VueJsonPretty from "vue-json-pretty";
import CollectionSelection from "@/components/CollectionSelection.vue";
import { ReloadOutlined } from "@ant-design/icons-vue";

export default defineComponent({
  name: "CreateToken",
  components: {
    CollectionSelection,
    VueJsonPretty,
    ReloadOutlined,
  },
  setup() {
    const collections: Ref<Event[]> = ref([]);
    const selectedCollection: Ref<any | null> = ref(null);
    const store = useStore(key);
    const tapFetch = async () => {
      if (store.state.account) {
        const res = await fetchCollections(store.state.account.address());
        if (res) {
          collections.value = res;
        }
        console.log(res);
      }
    };

    // tapFetch();

    const tokenName = ref("");
    const tokenDesc = ref("");
    const tokenBalance = ref(0);
    const tokenMaximum = ref(0);
    const tokenUri = ref("");
    const royaltyPayeeAddress = ref("");
    const royaltyDenominator = ref(0);
    const royaltyNumerator = ref(0);

    const creatingToken = ref(false);
    const tokenResult: Ref<Transaction | null> = ref(null);
    const tapCreate = async () => {
      if (store.state.account) {
        creatingToken.value = true;
        const collectionName = selectedCollection.value;
        const res = await create_token(
          store.state.account,
          collectionName,
          tokenName.value,
          tokenDesc.value,
          tokenBalance.value,
          tokenMaximum.value,
          tokenUri.value,
          royaltyDenominator.value,
          royaltyNumerator.value
        );
        creatingToken.value = false;
        tokenResult.value = res;
      }
    };

    tapFetch();

    watch(selectedCollection, (value) => {
      console.log(value);
    });

    return {
      tapFetch,
      collections,
      selectedCollection,
      tokenName,
      tokenDesc,
      tokenBalance,
      tokenUri,
      tokenMaximum,
      royaltyPayeeAddress,
      royaltyDenominator,
      royaltyNumerator,
      tapCreate,
      creatingToken,
      tokenResult,
    };
  },
  watch: {
    "store.state.account": function () {
      this.tapFetch();
    },
  },
});
</script>

<style scoped lang="scss">
.selected-item {
  border: 2px solid red;
  border-radius: 4px;
}

.collection-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  grid-gap: 10px;
}
</style>
