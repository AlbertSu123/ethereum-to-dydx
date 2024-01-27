import axios from "axios";
import { convertToDydxAddress } from "./crypto";
import { SquidParams } from "./types";
import dotenv from "dotenv";
dotenv.config();

/**
 * Get the route from Squid Router
 * @param params - The params to send to Squid Router
 * @returns The route from Squid Router
 */
export const getRoute = async (params) => {
  const result = await axios.get(process.env.SQUID_API_URL!, {
    params: params,
    headers: {
      "x-integrator-id": process.env.SQUID_INTEGRATOR_ID,
    },
  });
  return result.data;
};

/**
 * Generate the params for Squid Router
 * @param params - The params to send to Squid Router
 * @param publicKey - The public key to convert to DyDx address
 * @returns The params for Squid Router
 */
export const generateParams = (
  params: SquidParams,
  publicKey: string
): SquidParams => {
  return { ...params, toAddress: convertToDydxAddress(publicKey) };
};
