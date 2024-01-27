# README

## Purpose
Create a user operation that allows a user to bridge from Ethereum to dydx

## Overview
This is primarily focused on interacting with the Squid Router and converting public keys into DyDx address format. It also includes functionality for generating user operations and validating Ethereum addresses. The codebase is written in TypeScript and relies on several external libraries such as axios, @cosmjs/crypto, @cosmjs/encoding, @alchemy/aa-accounts, @alchemy/aa-alchemy, and @alchemy/aa-core.

### File Descriptions

1. src/squidRouter.ts: This file contains functions for interacting with the Squid Router. It includes getRoute which fetches a route from the Squid Router, and convertToDydxAddress which converts a public key into a DyDx address format. It also includes generateParams which generates the parameters for the Squid Router.

2. src/userOperation.ts: This file contains the generateUserOp function which generates a user operation. It uses the generateParams and getRoute functions from squidRouter.ts and the buildUserOperationFromTx function from the AlchemyProvider class.

3. src/crypto.ts: This file contains functions for validating Ethereum addresses and converting them to a checksummed format.

### Risks

1. Dependency Risks: The codebase relies heavily on external libraries. If these libraries are not maintained or have vulnerabilities, it could impact the functionality and security of the codebase. I personally have not looked at any of the cryptography libraries, and have no idea if they are commonly used or not.

2. Public Key Validation: The convertToDydxAddress function assumes the input public key is in a valid format. If an invalid public key is provided, it could lead to unexpected behavior or errors. I am assuming you can get a public key from privy.

3. Error Handling: The codebase currently lacks comprehensive error handling. This could lead to unhandled exceptions and make debugging more difficult. I can add this later, but it is not present currently.

## Crypto

### Address Validation and Conversion:

- The code provides tools for working with Ethereum and DyDx addresses, focusing on validation and conversion processes.
- The isValidAddress function verifies if a given string adheres to the Ethereum address format, including checksum validation for error prevention.
- The toChecksummedAddress function converts an Ethereum address into its checksummed version, which incorporates a checksum to minimize typos and mishandling.
DyDx Address Generation:

- The convertToDydxAddress function is specifically designed to convert public keys into DyDx addresses, a format used for identifying accounts on the dYdX decentralized exchange.
- It meticulously transforms the public key through hexification, decompression, hashing, byte extraction, and checksum application to produce the valid DyDx address string.
- This function plays a crucial role in enabling users to interact with dYdX services using their public keys as dydx might have a different curve from

Note, it is entirely possible that all of this is useless as dydx may natively support metamask, I was unable to confirm this so it would be good to check in with the dydx people.
