<template>
  <v-card class="mt-6 create-card">
    <v-row>
      <v-col cols="8">
        <v-card-title>
          Create Token
          <v-btn icon size="20" @click="tapFetch">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-card-title>
        <!--    <v-card-item>-->
        <v-card-item>
          <!--          <v-autocomplete-->
          <!--            label="collection"-->
          <!--            item-value="data.collection_name"-->
          <!--            :items="collections"-->
          <!--            item-title="data.collection_name"-->
          <!--            v-model="selectedCollection"-->
          <!--            filled-->
          <!--            chips-->
          <!--            closable-chips-->
          <!--            color="blue-grey-lighten-2"-->
          <!--            hide-details-->
          <!--          >-->
          <!--            <template v-slot:chip="{ props, item }">-->
          <!--              <v-chip-->
          <!--                v-bind="props"-->
          <!--                :prepend-avatar="item.raw.data.uri"-->
          <!--                :text="item.raw.data.collection_name"-->
          <!--              ></v-chip>-->
          <!--            </template>-->
          <!--            <template v-slot:item="{ props, item }">-->
          <!--              <v-list-item-->
          <!--                v-bind="props"-->
          <!--                :prepend-avatar="item.raw.data.uri"-->
          <!--                :title="item.raw.data.collection_name"-->
          <!--              ></v-list-item>-->
          <!--            </template>-->
          <!--          </v-autocomplete>-->
          <v-item-group
            v-model="selectedCollection"
            selected-class="selected-item"
          >
            <v-row no-gutters>
              <v-col v-for="(item, index) in collections" :key="index">
                <v-item v-slot="{ selectedClass, toggle }">
                  <v-card @click="toggle">
                    <div :class="[selectedClass]" class="collection-item">
                      <v-img
                        cover
                        :aspect-ratio="1"
                        max-width="100px"
                        max-height="100px"
                        :src="item.data.uri"
                      >
                      </v-img>
                      <p class="mt-4">
                        {{ item.data.collection_name }}
                      </p>
                    </div>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>
          <v-text-field label="token name" v-model="tokenName" hide-details>
          </v-text-field>
          <v-text-field
            label="token description"
            v-model="tokenDesc"
            hide-details
          >
          </v-text-field>
          <v-text-field label="token uri" v-model="tokenUri" hide-details>
          </v-text-field>
          <v-text-field
            label="token balance"
            v-model="tokenBalance"
            type="number"
            hide-details
          >
          </v-text-field>
          <v-text-field
            label="token maximum"
            v-model="tokenMaximum"
            type="number"
            hide-details
          >
          </v-text-field>
          <v-text-field
            label="royalty denominator"
            v-model="royaltyDenominator"
            type="number"
            hide-details
          >
          </v-text-field>
          <v-text-field
            label="royalty numerator"
            v-model="royaltyNumerator"
            type="number"
            hide-details
          >
          </v-text-field>
          Result:
          <vue-json-pretty :data="tokenResult"> </vue-json-pretty>
          <v-btn
            :loading="creatingToken"
            color="primary"
            class="mt-6"
            @click="tapCreate"
          >
            CREATE
          </v-btn>
        </v-card-item>
      </v-col>
      <v-col col="4">
        <v-img :src="tokenUri" max-height="300"> </v-img>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { create_token, fetchCollections } from "@/utils/TokenRepository";
import { Event, Transaction } from "aptos/dist/generated";
import VueJsonPretty from "vue-json-pretty";

export default defineComponent({
  name: "CreateToken",
  components: {
    VueJsonPretty,
  },
  setup() {
    const collections: Ref<Event[]> = ref([]);
    const selectedCollection = ref(0);
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
        const collectionName =
          collections.value[selectedCollection.value].data.collection_name;
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
