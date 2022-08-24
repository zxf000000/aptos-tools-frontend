<template>
  <a-select
    style="width: 100%"
    size="large"
    :loading="loading"
    :value="selectedCollection"
    @change="inputChange"
    placeholder="select collection"
  >
    <a-select-option
      :value="item.name"
      v-for="(item, index) in collections"
      :key="index"
    >
      <div class="selected-option-item">
        <a-avatar :src="item.uri"></a-avatar>
        <a-typography-text style="margin-left: 10px">{{
          item.name
        }}</a-typography-text>
      </div>
    </a-select-option>
  </a-select>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { fetchCollections } from "@/utils/TokenRepository";
export default defineComponent({
  name: "CollectionSelection",
  props: ["selectedCollection"],
  emits: ["update:selectedCollection"],
  setup() {
    const store = useStore(key);
    const collections: Ref<any[]> = ref([]);
    const loading = ref(false);
    const loadCollections = async () => {
      if (store.state.account) {
        loading.value = true;
        const res = await fetchCollections(store.state.account.address());
        if (res) {
          collections.value = res;
        }
        loading.value = false;
      }
    };
    loadCollections();
    return {
      loading,
      collections,
      loadCollections,
    };
  },
  methods: {
    inputChange(value: number) {
      this.$emit("update:selectedCollection", value);
    },
  },
  watch: {
    "store.state.account": function () {
      this.loadCollections();
    },
  },
});
</script>

<style scoped></style>
