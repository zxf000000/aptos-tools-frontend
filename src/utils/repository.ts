import { aptosClient, faucetClient } from "@/utils/client";
import {
  AptosAccount,
  AptosClient,
  MaybeHexString,
  TxnBuilderTypes,
  Types,
} from "aptos";
import { Buffer } from "buffer";
import { bcsSerializeStr } from "aptos/dist/transaction_builder/bcs";

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
) {
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
  const { sequenceNumber, chainId } = await getSequenceNumberAndChainId(
    account
  );

  const rawTxn = new TxnBuilderTypes.RawTransaction(
    TxnBuilderTypes.AccountAddress.fromHex(account.address()),
    BigInt(sequenceNumber),
    scriptFunctionPayload,
    1000n,
    1n,
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new TxnBuilderTypes.ChainId(chainId)
  );
  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);
  return await aptosClient.submitSignedBCSTransaction(bcsTxn);
}
