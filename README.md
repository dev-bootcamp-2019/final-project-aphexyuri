# Lost and Found (LAF)

### What is LAF?
A Solidity and React dApp to...
- Post lost items & offer an ETH reward.
- Find lost items near you & claim your ETH rewards.

At time of writing, LAF only supports a **lost -> found -> return to owner** workflow. Most of the contract was written to *also* support a **found -> return to owner** workflow, but due to time constraints this has not ben included in the project.

---

### Running LAF
(On top of a Ganache local chain)

1. Clone this repo
2. In the root directory, run `ganache-cli` to start your local ganache chain
3. Still in the root directory, run `truffle migrate --reset` to deploy contracts
4. Copy `build/contracts/LAFAssetRegistry.json` to the `client/src/contracts` directory
5. From the `client` directory, run `npm run start` to start the local webserver. UI can then be accessed at [http://localhost:3000](http://localhost:3000)
