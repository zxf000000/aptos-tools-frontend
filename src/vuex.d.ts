import { Store } from "vuex";
import { AptosAccount } from "aptos";

declare module "@vue/runtime-core" {
  interface State {
    account: AptosAccount | null;
  }
  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}
