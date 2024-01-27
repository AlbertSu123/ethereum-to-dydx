export type SquidParams = {
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
