import { toAscii, toHex } from "@iov/encoding";
import { Address } from "@iov/bcp";
import { Keccak256 } from "@iov/crypto";
import { fromHex } from "@cosmjs/encoding";
import { Secp256k1 } from "@cosmjs/crypto";

/**
 * Checks if the given string is a valid Ethereum address.
 * Note: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
 * @param address - The address to check
 * @returns true if the given string is a valid Ethereum address, false otherwise
 */
export function isValidAddress(address: string): boolean {
  if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return false;
  }

  const isChecksummed = !address.match(/^0x[a-f0-9]{40}$/);
  if (isChecksummed) {
    const addressLower = address.toLowerCase().replace("0x", "");
    const addressHash = toHex(new Keccak256(toAscii(addressLower)).digest());
    for (let i = 0; i < 40; i++) {
      if (
        (parseInt(addressHash[i], 16) > 7 &&
          addressLower[i].toUpperCase() !== address[i + 2]) ||
        (parseInt(addressHash[i], 16) <= 7 &&
          addressLower[i] !== address[i + 2])
      ) {
        return false;
      }
    }
    return true;
  } else {
    return true;
  }
}

/**
 * Converts Ethereum address to checksummed address according to EIP-55.
 *
 * Input address must be valid, i.e. either all lower case or correctly checksummed.
 * @param address - The address to convert
 * @returns The checksummed address
 *
 * @link https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md
 */
export function toChecksummedAddress(address: string | Uint8Array): Address {
  let addressLower: string;

  if (typeof address === "string") {
    if (!isValidAddress(address)) {
      throw new Error("Input is not a valid Ethereum address");
    }
    addressLower = address.toLowerCase().replace("0x", "");
  } else {
    if (address.length !== 20) {
      throw new Error("Invalid Ethereum address length. Must be 20 bytes.");
    }
    addressLower = toHex(address);
  }

  const addressHash = toHex(new Keccak256(toAscii(addressLower)).digest());
  let checksumAddress = "0x";
  for (let i = 0; i < 40; i++) {
    checksumAddress +=
      parseInt(addressHash[i], 16) > 7
        ? addressLower[i].toUpperCase()
        : addressLower[i];
  }
  return checksumAddress as Address;
}

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
export const convertToDydxAddress = (publicKey: string): string => {
  const hexifiedPublicKey = fromHex(publicKey);
  const uncompressedPublicKey = Secp256k1.uncompressPubkey(hexifiedPublicKey);
  const hash = new Keccak256(uncompressedPublicKey.slice(1)).digest();
  const lastTwentyBytes = hash.slice(-20);
  const hexifiedLastTwentyBytes = toHex(lastTwentyBytes);
  const checksummedAddress = toChecksummedAddress(hexifiedLastTwentyBytes);
  return checksummedAddress;
};
