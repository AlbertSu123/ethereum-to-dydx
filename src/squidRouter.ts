import axios from "axios";
import { Keccak256, Secp256k1 } from "@cosmjs/crypto";
import { fromHex, toHex } from "@cosmjs/encoding";
import { toChecksummedAddress } from "./crypto";
import { SquidParams } from "../types";
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
 * Converts a public key into a DyDx address format.
 *
 * @param {string} publicKey - The public key to convert.
 * @returns {string} The DyDx address.
 *
 * ## Purpose
 *
 * - Specifically used for identifying accounts on the dYdX decentralized exchange.
 *
 * ## Steps
 *
 * 1. **Hexifying the Public Key:**
 *     - Converts the public key string into a hex-encoded byte array using `fromHex`.
 *     - Ensures compatibility with cryptographic operations.
 *
 * 2. **Uncompressing the Public Key:**
 *     - Converts the compressed public key into its uncompressed form using `Secp256k1.uncompressPubkey`.
 *     - Necessary for compatibility with Keccak-256 hashing.
 *
 * 3. **Hashing with Keccak-256:**
 *     - Creates a Keccak-256 hash object.
 *     - Slices off the first byte of the uncompressed public key.
 *     - Hashes the remaining 64 bytes to generate a 32-byte hash.
 *
 * 4. **Extracting Last 20 Bytes:**
 *     - Takes the last 20 bytes of the hash, which form the basis of the DyDx address.
 *
 * 5. **Hexifying the Last 20 Bytes:**
 *     - Converts the extracted 20 bytes back into a hex-encoded string using `toHex`.
 *
 * 6. **Applying Checksum:**
 *     - Uses `toChecksummedAddress` to apply a checksum for address validation and error prevention.
 *
 * 7. **Returning the DyDx Address:**
 *     - Returns the final checksummed DyDx address string.
 *
 * ## Key Points
 *
 * - Relies on external functions: `fromHex`, `Secp256k1.uncompressPubkey`, `toHex`, and `toChecksummedAddress`.
 * - Assumes the input public key is in a valid format.
 * - Employs Keccak-256, a common hash algorithm in blockchain technologies.
 * - Produces a checksummed address to enhance error prevention.
 *
 * @link https://github.com/cosmos/cosmjs/issues/1044
 */
const convertToDydxAddress = (publicKey: string): string => {
  const hexifiedPublicKey = fromHex(publicKey);
  const uncompressedPublicKey = Secp256k1.uncompressPubkey(hexifiedPublicKey);
  const hash = new Keccak256(uncompressedPublicKey.slice(1)).digest();
  const lastTwentyBytes = hash.slice(-20);
  const hexifiedLastTwentyBytes = toHex(lastTwentyBytes);
  const checksummedAddress = toChecksummedAddress(hexifiedLastTwentyBytes);
  return checksummedAddress;
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
