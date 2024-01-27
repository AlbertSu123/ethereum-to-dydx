import axios from "axios";
import { Keccak256, Secp256k1 } from "@cosmjs/crypto";
import { fromHex, toHex } from "@cosmjs/encoding";
import { toChecksummedAddress } from "./crypto";

export const getRoute = async (params) => {
  const result = await axios.get(
    "https://testnet.api.squidrouter.com/v1/route",
    {
      params: params,
      headers: {
        "x-integrator-id": "your-integrator-id",
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