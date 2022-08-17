import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AccountPage from "@/views/AccountPage.vue";
import ModulePage from "@/views/ModulePage.vue";
import CoinPage from "@/views/CoinPage.vue";
import { store } from "@/store";
import AccountFund from "@/views/AccountFund.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    children: [
      {
        path: "module",
        name: "ModulePage",
        component: ModulePage,
      },
      {
        path: "coin",
        name: "CoinPage",
        component: CoinPage,
      },
      {
        path: "fund",
        name: "FundPage",
        component: AccountFund,
      },
    ],
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
