# Lost and Found (LAF)
For consideration for **ConsenSys Academy’s 2018 - 2019 Developer Program Final Project**

### What is LAF?
A Solidity and React dApp to...
- Post lost items & offer an ETH reward.
- Find lost items near you & claim your ETH rewards.

At time of writing, LAF only supports a **lost -> found -> return to owner** workflow. Most of the contract was written to *also* support a **found -> return to owner** workflow, but due to time constraints this has not been included/tested in the project.

---

### Running LAF
(On top of a local Ganache chain running on port 8545)

1. Clone this repo
2. In the root directory, run `ganache-cli` to start your local ganache chain
3. Still in the root directory, run `truffle migrate` to deploy contracts
4. From the `client` directory, run `npm run start` to start the local webserver. UI can then be accessed at [http://localhost:3000](http://localhost:3000)


### You'll need some test ETH
Ropsten:
- https://faucet.metamask.io/
- https://faucet.ropsten.be/

---

### Key project notes

- Solidity 0.5.0 chose for up to date platform & language familiarity
- Use of OpenZeppelin's contracts (Ownable, Pausable, SafeMath) - tried, tested & secure


### Tools & Resources
- IPFS multihash - https://github.com/saurfang/ipfs-multihash-on-solidity
- OpenZeppelin

---

Mirror repo cmds: `git fetch -p origin` -> `git push --mirror`