<template>
  <a-card class="elevation-4 mt-6 pa-4 rounded-lg">
    <template #title> Modify token </template>
    <collection-selection
      :selected-collection="collection"
      @update:selected-collection="collectionChange"
    ></collection-selection>
    <a-select
      v-model:value="selectedToken"
      placeholder="select token"
      style="width: 100%"
    >
      <a-select-option
        :value="item.name"
        v-for="(item, index) in tokens"
        :key="index"
      >
        <div class="selected-option-item">
          <a-avatar :src="item.tokenData.uri"></a-avatar>
          <a-typography-text style="margin-left: 10px">{{
            item.tokenData.name
          }}</a-typography-text>
        </div>
      </a-select-option>
    </a-select>
    <div class="token-data__content" v-if="currentTokenData">
      <a-row :gutter="20">
        <a-col :span="4">
          <span>name: </span>
          <span>{{ currentTokenData.tokenData.name }}</span>
        </a-col>
        <a-col :span="4">
          <span>uri: </span>
          <a target="_blank" :href="currentTokenData.tokenData.uri">
            {{ currentTokenData.tokenData.uri }}
          </a>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>

<script lang="ts">
import { key } from "@/store";
import { defineComponent, Ref, ref, watch } from "vue";
import { useStore } from "vuex";
import { fetchTokens } from "@/utils/TokenRepository";
import CollectionSelection from "@/components/CollectionSelection.vue";

export default defineComponent({
  name: "ModifyToken",
  components: { CollectionSelection },
  setup() {
    const store = useStore(key);
    const collection = ref("");
    const tokens: Ref<any[]> = ref([]);
    const selectedToken: Ref<number | null> = ref(null);
    const currentTokenData: Ref<any | null> = ref(null);
    const getTokens = async () => {
      if (store.state.account) {
        tokens.value = await fetchTokens(
          store.state.account.address(),
          collection.value
        );
      }
    };
    getTokens();
    return {
      currentTokenData,
      selectedToken,
      tokens,
      getTokens,
      collection,
    };
  },
  methods: {
    collectionChange(value: string) {
      this.collection = value;
      this.getTokens();
    },
  },
  watch: {
    selectedToken(newVal) {
      if (newVal !== null) {
        this.currentTokenData = this.tokens[newVal];
      }
    },
  },
});
</script>

<style scoped lang="scss">
.token-data__content {
  width: 100%;
  margin: 20px 0 0 0;
  background: yellow;
  min-height: 100px;
}
</style>
