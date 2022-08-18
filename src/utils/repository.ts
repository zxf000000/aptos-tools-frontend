import { aptosClient, faucetClient } from "@/utils/client";
import {
  AptosAccount,
  AptosClient,
  HexString,
  MaybeHexString,
  TxnBuilderTypes,
} from "aptos";
import { Buffer } from "buffer";
import {
  bcsSerializeStr,
  bcsSerializeUint64,
  Serializer,
} from "aptos/dist/transaction_builder/bcs";
import { Transaction } from "aptos/dist/generated";

export async function fetchUserBalance(address: MaybeHexString) {
  if (address) {
    const resource = await aptosClient.getAccountResource(
      address,
      "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    if (resource == null) {
      return null;
    }
    return parseInt((resource.data as any)["coin"]["value"]);
  }
  return null;
}

export async function createAccount(): Promise<AptosAccount> {
  const account = new AptosAccount();
  await faucetClient.fundAccount(account.address(), 0);
  return account;
}

export async function importAccount(privateKey: string): Promise<AptosAccount> {
  let pkey = privateKey;
  if (pkey.startsWith("0x")) {
    pkey = pkey.replace("0x", "");
  }
  const arr = Buffer.from(pkey, "hex");
  const account = new AptosAccount(arr);
  await faucetClient.fundAccount(account.address(), 0);
  return account;
}

export async function getSequenceNumberAndChainId(account: AptosAccount) {
  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    aptosClient.getAccount(account.address()),
    aptosClient.getChainId(),
  ]);
  return {
    sequenceNumber,
    chainId,
  };
}

export async function initializeCoin(
  account: AptosAccount,
  coinAddress: MaybeHexString,
  coinModuleName: string,
  coinStructName: string,
  coinName: string,
  coinSymbol: string
): Promise<Transaction> {
  const typeTag = new TxnBuilderTypes.TypeTagStruct(
    TxnBuilderTypes.StructTag.fromString(
      `${(
        coinAddress as HexString
      ).hex()}::${coinModuleName}::${coinStructName}`
    )
  );

  console.log(typeTag);
  const serializer = new Serializer();
  serializer.serializeBool(false);
  const scriptFunc = TxnBuilderTypes.ScriptFunction.natural(
    "0x1::managed_coin",
    "initialize",
    [typeTag],
    [
      bcsSerializeStr(coinName),
      bcsSerializeStr(coinSymbol),
      bcsSerializeUint64(6),
      serializer.getBytes(),
    ]
  );
  const payload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
    scriptFunc
  );
  return await executeTransactionWithPayload(account, payload);
}

export async function fetchModules(account: AptosAccount) {
  const res = await aptosClient.getAccountModules(account.address());
  const data = {
    key: {
      title: "article title1111",
    },
    key_type: `${account.address()}::MySpaceB::ArticleId`,
    value_type: `${account.address()}::MySpaceB::Article`,
  };
  const tableItem = await aptosClient.getTableItem(
    "39661769939230585698425587844583073784",
    data
  );
  console.log(res, tableItem);
}

export async function executeFunction(
  account: AptosAccount,
  moduleName: string,
  funName: string,
  params: string[]
): Promise<Transaction> {
  const args = params.map((arg) => {
    return bcsSerializeStr(arg);
  });
  const scriptFunctionPayload =
    new TxnBuilderTypes.TransactionPayloadScriptFunction(
      TxnBuilderTypes.ScriptFunction.natural(
        `${account.address()}::${moduleName}`,
        funName,
        [],
        args
      )
    );
  return executeTransactionWithPayload(account, scriptFunctionPayload);
  // const { sequenceNumber, chainId } = await getSequenceNumberAndChainId(
  //   account
  // );
  //
  // const rawTxn = new TxnBuilderTypes.RawTransaction(
  //   TxnBuilderTypes.AccountAddress.fromHex(account.address()),
  //   BigInt(sequenceNumber),
  //   scriptFunctionPayload,
  //   1000n,
  //   1n,
  //   BigInt(Math.floor(Date.now() / 1000) + 10),
  //   new TxnBuilderTypes.ChainId(chainId)
  // );
  // const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);
  // const txRes = await aptosClient.submitSignedBCSTransaction(bcsTxn);
  // // await aptosClient.waitForTransaction(txRes.hash);
  // // console.log("complete");
  // setTimeout(() => {
  //   const res = axios.request({
  //     method: "GET",
  //     url:
  //       NODE_URL +
  //       "/transactions/0xbbfdc3f7a8097690bc7c270a98da68c9fb21020d81f467fc8e96e4c371085ab3",
  //   });
  //   console.log(res);
  // }, 2000);
  // return txRes;
}

export async function executeTransactionWithPayload(
  accountFrom: AptosAccount,
  payload: any
): Promise<Transaction> {
  const { sequenceNumber, chainId } = await getSequenceNumberAndChainId(
    accountFrom
  );
  const rawTxn = new TxnBuilderTypes.RawTransaction(
    TxnBuilderTypes.AccountAddress.fromHex(accountFrom.address()),
    BigInt(sequenceNumber),
    payload,
    1000n,
    1n,
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new TxnBuilderTypes.ChainId(chainId)
  );
  const bcsTxn = AptosClient.generateBCSTransaction(accountFrom, rawTxn);
  const txRes = await aptosClient.submitSignedBCSTransaction(bcsTxn);
  return await aptosClient.waitForTransactionWithResult(txRes.hash);
  // console.log("complete");
  // return await new Promise((resolve) => {
  //   setTimeout(() => {
  //     axios
  //       .request({
  //         method: "GET",
  //         url: NODE_URL + "/transactions/" + txRes.hash,
  //       })
  //       .then((res) => {
  //         resolve(res.data as Transaction);
  //       });
  //   }, 2000);
  // });
}
