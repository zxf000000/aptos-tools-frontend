import router from "@/router";
import { store } from "@/store";

router.beforeEach((to, from, next) => {
  if (store.state.account) {
    if (to.path === "/account") {
      next("/");
    } else {
      next();
    }
  } else if (to.path !== "/account") {
    next(`/account?redirect=${to.path}`);
  } else {
    next();
  }
});
