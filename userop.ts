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

type SquidParams = {
  fromChain: number;
  fromToken: string;
  fromAmount: string;
  toChain: number;
  toToken: string;
  fromAddress: string;
  toAddress: string;
  slippage: number;
  enableForecall?: boolean;
};

const chain = sepolia;
const PRIVATE_KEY = "0xliterallycanbeanyprivatekey" as Hex;
const owner = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);

const provider = new AlchemyProvider({
  // get your Alchemy API key at https://dashboard.alchemy.com
  apiKey: "ALCHEMY_API_KEY",
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
