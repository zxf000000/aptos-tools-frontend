import { AptosAccount, MaybeHexString, TxnBuilderTypes, Types } from "aptos";
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
    const [resource, collectionEvents] = await Promise.all([
      await aptosClient.getAccountResource(address, "0x3::token::Collections"),
      aptosClient.getEventsByEventHandle(
        address,
        "0x3::token::Collections",
        "create_collection_events"
      ),
    ]);
    const tableHandle = (resource.data as any).collection_data.handle;
    const fetchArr: Promise<any>[] = [];
    collectionEvents.forEach((event) => {
      fetchArr.push(
        aptosClient.getTableItem(tableHandle, {
          key_type: "0x1::string::String",
          value_type: "0x3::token::CollectionData",
          key: (event.data as any).collection_name,
        })
      );
    });
    const collections = await Promise.all(fetchArr);
    console.log(collections, "collectionssss");
    return collections;
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
  const txPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
    TxnBuilderTypes.EntryFunction.natural(
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
  const txPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
    TxnBuilderTypes.EntryFunction.natural(
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
        serializeVectorBool([true, true, true, true, true]),
        serializer.getBytes(),
        serializer.getBytes(),
        serializer.getBytes(),
      ]
    )
  );
  console.log("create token");
  return executeTransactionWithPayload(account, txPayload);
}
