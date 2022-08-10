import { createStore, Store } from "vuex";
import { InjectionKey } from "vue";
import { AptosAccount } from "aptos";
import router from "@/router";

export interface State {
  account: AptosAccount | null;
}
export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    account: null,
  },
  mutations: {
    updateAccount(state: State, account: AptosAccount) {
      state.account = account;
      localStorage.setItem("pkey", account.toPrivateKeyObject().privateKeyHex);
    },
    clearAccount(state: State) {
      state.account = null;
      localStorage.removeItem("pkey");
      router.push("/account");
    },
  },
  actions: {},
  modules: {},
});
