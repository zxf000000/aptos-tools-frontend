<template>
  <v-container fluid>
    <v-autocomplete
      @change="inputChange"
      item-title="name"
      item-value="name"
      label="collection"
      :items="collections"
      chips
      dense
    >
      <!--      <template v-slot:item="{ props, item }">-->
      <!--        <v-list-item-->
      <!--          :prepend-avatar="item.raw.uri"-->
      <!--          :title="item.raw.name"-->
      <!--          :subtitle="item.raw.description"-->
      <!--          v-bind="props"-->
      <!--        >-->
      <!--        </v-list-item>-->
      <!--      </template>-->
    </v-autocomplete>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import { useStore } from "vuex";
import { key } from "@/store";
import { fetchCollections } from "@/utils/TokenRepository";
export default defineComponent({
  name: "CollectionSelection",
  setup() {
    const store = useStore(key);
    const collections: Ref<any[]> = ref([]);
    const loadCollections = async () => {
      if (store.state.account) {
        const res = await fetchCollections(store.state.account.address());
        if (res) {
          collections.value = res;
        }
      }
    };
    loadCollections();
    return {
      collections,
      loadCollections,
    };
  },
  methods: {
    inputChange(value: string) {
      console.log(value);
      this.$emit("input", value);
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
