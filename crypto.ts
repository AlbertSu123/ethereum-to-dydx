import { toAscii, toHex } from "@iov/encoding";
import { Address } from "@iov/bcp";
import { Keccak256 } from "@iov/crypto";

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
