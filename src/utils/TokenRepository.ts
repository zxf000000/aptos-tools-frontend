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
  address: MaybeHexString,
  collection: string
): Promise<any[]> {
  const [resources, tokens, collections] = await Promise.all([
    aptosClient.getAccountResource(address, "0x3::token::TokenStore"),
    aptosClient.getEventsByEventHandle(
      address,
      "0x3::token::TokenStore",
      "deposit_events"
    ),
    aptosClient.getAccountResource(address, "0x3::token::Collections"),
  ]);
  const arr: Promise<any>[] = [];
  const tableHandle = (resources.data as any).tokens.handle;
  const tokenDataTableHandle = (collections.data as any).token_data.handle;
  console.log(collections, tokenDataTableHandle);
  tokens
    .filter((tokenEvent) => {
      return tokenEvent.data.id.token_data_id.collection === collection;
    })
    .forEach((tokenEvent) => {
      arr.push(
        Promise.allSettled([
          aptosClient.getTableItem(tableHandle, {
            key_type: "0x3::token::TokenId",
            value_type: "0x3::token::Token",
            key: tokenEvent.data.id,
          }),
          aptosClient.getTableItem(tokenDataTableHandle, {
            key_type: "0x3::token::TokenDataId",
            value_type: "0x3::token::TokenData",
            key: tokenEvent.data.id.token_data_id,
          }),
        ])
      );
    });
  const results = await Promise.allSettled(arr);

  return results
    .filter((result) => {
      console.log(result);
      if (result.status === "fulfilled") {
        const value = (result as PromiseFulfilledResult<any>).value;
        return (
          value[0].status === "fulfilled" && value[1].status === "fulfilled"
        );
      }
      return false;
    })
    .map((result) => {
      const value = (result as PromiseFulfilledResult<any>).value;
      return {
        token: value[0].value,
        tokenData: value[1].value,
      };
    });
}

export async function fetchCollections(address: MaybeHexString) {
  if (address) {
    const [resource, collectionEvents] = await Promise.all([
      aptosClient.getAccountResource(address, "0x3::token::Collections"),
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
