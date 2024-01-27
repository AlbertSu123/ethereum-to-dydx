import axios from "axios";
import { Keccak256, Secp256k1 } from "@cosmjs/crypto";
import { fromHex, toHex } from "@cosmjs/encoding";
import { toChecksummedAddress } from "./crypto";
import { SquidParams } from "./types";
import dotenv from "dotenv";
dotenv.config();

export const getRoute = async (params) => {
  const result = await axios.get(
    process.env.SQUID_API_URL!,
    {
      params: params,
      headers: {
        "x-integrator-id": process.env.SQUID_INTEGRATOR_ID,
      },
    }
  );
  return result.data;
};

const convertToDydxAddress = (publicKey: string): string => {
  const hexifiedPublicKey = fromHex(publicKey);
  const uncompressedPublicKey = Secp256k1.uncompressPubkey(hexifiedPublicKey);
  const hash = new Keccak256(uncompressedPublicKey.slice(1)).digest();
  const lastTwentyBytes = hash.slice(-20);
  const hexifiedLastTwentyBytes = toHex(lastTwentyBytes);
  const checksummedAddress = toChecksummedAddress(hexifiedLastTwentyBytes);
  return checksummedAddress;
};

export const generateParams = (
  params: SquidParams,
  publicKey: string
): SquidParams => {
  return { ...params, toAddress: convertToDydxAddress(publicKey) };
};
