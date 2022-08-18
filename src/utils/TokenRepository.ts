import { AptosAccount, MaybeHexString, TxnBuilderTypes } from "aptos";
import {
  bcsSerializeStr,
  bcsSerializeUint64,
  bcsToBytes,
  Serializer,
} from "aptos/dist/transaction_builder/bcs";
import { executeTransactionWithPayload } from "@/utils/repository";
import { aptosClient, tokenClient } from "@/utils/client";

function serializeVectorBool(vecBool: boolean[]) {
  const serializer = new Serializer();
  serializer.serializeU32AsUleb128(vecBool.length);
  vecBool.forEach((el) => {
    serializer.serializeBool(el);
  });
  return serializer.getBytes();
}

export async function fetchToken(
  address: MaybeHexString,
  collection: string,
  tokenName: string
) {
  return await tokenClient.getTokenData(address, collection, tokenName);
}

export async function fetchTokens(
  address: MaybeHexString = "0x7f58672cb3892c7942a89da828e3613a99015f6096209c96816a2a97ba65053d"
) {
  return await aptosClient.getEventsByEventHandle(
    address,
    "0x3::token::TokenStore",
    "deposit_events"
  );
}

export async function fetchCollections(address: MaybeHexString) {
  if (address) {
    // const resource = await aptosClient.getAccountResource(
    //   address,
    //   "0x3::token::Collections"
    // );
    return await aptosClient.getEventsByEventHandle(
      address,
      "0x3::token::Collections",
      "create_collection_events"
    );
  }
  return null;
}

export async function create_collection(
  account: AptosAccount,
  name: string,
  description: string,
  uri: string,
  maximum: number
) {
  const txPayload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
    TxnBuilderTypes.ScriptFunction.natural(
      "0x3::token",
      "create_collection_script",
      [],
      [
        bcsSerializeStr(name),
        bcsSerializeStr(description),
        bcsSerializeStr(uri),
        bcsSerializeUint64(maximum),
        serializeVectorBool([false, false, false]),
      ]
    )
  );
  return await executeTransactionWithPayload(account, txPayload);
}

export async function create_token(
  account: AptosAccount,
  collection: string,
  name: string,
  description: string,
  balance: number, // u64
  maximum: number, // u64
  uri: string,
  // royalty_payee_address: string,
  royalty_points_denominator: number, // u64
  royalty_points_numerator: number // u64
  // token_mutate_setting: boolean[]  // all false
  // property_keys: string[],
  // property_values: Uint8Array,
  // property_types: string[],
) {
  const serializer = new Serializer();
  serializer.serializeU32AsUleb128(0);
  const txPayload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
    TxnBuilderTypes.ScriptFunction.natural(
      "0x3::token",
      "create_token_script",
      [],
      [
        bcsSerializeStr(collection),
        bcsSerializeStr(name),
        bcsSerializeStr(description),
        bcsSerializeUint64(balance),
        bcsSerializeUint64(maximum),
        bcsSerializeStr(uri),
        bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(account.address())),
        bcsSerializeUint64(royalty_points_denominator),
        bcsSerializeUint64(royalty_points_numerator),
        serializeVectorBool([false, false, false, false, false]),
        serializer.getBytes(),
        serializer.getBytes(),
        serializer.getBytes(),
      ]
    )
  );
  console.log("create token");
  return executeTransactionWithPayload(account, txPayload);
}
