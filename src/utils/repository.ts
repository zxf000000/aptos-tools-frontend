import { aptosClient } from "@/utils/client";
import { MaybeHexString } from "aptos";

export async function fetchUserBalance(address: MaybeHexString) {
  if (address) {
    const resource = await aptosClient.getAccountResource(address, {
      address: "0x1",
      module: "coin",
      name: "CoinStore",
      generic_type_params: ["0x1::aptos_coin::AptosCoin"],
    });
    if (resource == null) {
      return null;
    }
    return parseInt((resource.data as any)["coin"]["value"]);
  }
  return null;
}
