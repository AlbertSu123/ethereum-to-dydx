import { generateParams, getRoute } from "./squidRouter";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LocalAccountSigner,
  type Hex,
  UserOperationStruct,
} from "@alchemy/aa-core";
import { sepolia } from "viem/chains";
import { getAddress } from "viem";
import { SquidParams } from "./types";
import dotenv from "dotenv";
dotenv.config();

const params = {
  fromChain: 5, // Goerli
  fromToken: "0xc778417E063141139Fce010982780140Aa0cD5Ab", // WETH on Ropsten
  fromAmount: "100000000000000000", // 0.1 WETH
  toChain: 1287, // Moonbase Alpha
  toToken: "0xd1633f7fb3d716643125d6415d4177bc36b7186b", // axlUSDC on Moonmbeam
  fromAddress: "0x...", // ethers.signer.address; transaction sender address
  toAddress: "0x...", // the recipient's address
  slippage: 3, // 3 --> 3.00% slippage. SDK supports 2 decimals
  enableForecall: true, // optional, defaults to true
};

const chain = sepolia;
// Note: this private key can be anything, we just need it because alchemy wants an account for their sdk
const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex;
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

const provider = new AlchemyProvider({
  apiKey: process.env.ALCHEMY_API_KEY!,
  chain,
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      rpcClient,
      owner,
      chain,
      factoryAddress: getDefaultLightAccountFactoryAddress(chain),
    })
);

export const generateUserOp = async (
  params: SquidParams,
  publicKey: string
): Promise<UserOperationStruct> => {
  const squidRouterParams = generateParams(params, publicKey);
  const route = await getRoute(squidRouterParams);
  const userOperationStruct = await provider.buildUserOperationFromTx({
    from: getAddress(params.fromAddress),
    to: route.transactionRequest.targetAddress,
    data: route.transactionRequest.data,
  });
  return userOperationStruct;
};

generateUserOp(params, "0x...");
