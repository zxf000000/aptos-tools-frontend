import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AccountPage from "@/views/AccountPage.vue";
import ModulePage from "@/views/ModulePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/account",
    name: "AccountPage",
    component: AccountPage,
  },
  {
    path: "/module",
    name: "ModulePage",
    component: ModulePage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
