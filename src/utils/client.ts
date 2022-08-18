import { AptosClient, FaucetClient, TokenClient } from "aptos";

export const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
export const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";

const aptosClient = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
const tokenClient = new TokenClient(aptosClient);

export { aptosClient, faucetClient, tokenClient };
