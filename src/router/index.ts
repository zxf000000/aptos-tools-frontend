import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AccountPage from "@/views/AccountPage.vue";

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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
