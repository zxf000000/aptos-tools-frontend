<template>
  <div fluid class="elevation-4 mt-6 pa-4 rounded-lg">
    <h3>Modify token</h3>
    <div class="mt-4">
      <v-autocomplete :items="collections" item-title="name" item-value="name">
      </v-autocomplete>
    </div>
  </div>
</template>

<script lang="ts">
import { key } from "@/store";
import { defineComponent, Ref, ref } from "vue";
import { useStore } from "vuex";
import { fetchCollections } from "@/utils/TokenRepository";
export default defineComponent({
  name: "ModifyToken",
  setup() {
    const store = useStore(key);
    const collections: Ref<any[]> = ref([]);
    const getCollections = async () => {
      if (store.state.account) {
        const res = await fetchCollections(store.state.account.address());
        if (res) {
          collections.value = res;
        }
      }
    };
    getCollections();
    return {
      getCollections,
      collections,
    };
  },
});
</script>

<style scoped></style>
