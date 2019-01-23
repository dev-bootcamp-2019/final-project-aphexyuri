# Lost and Found (LAF)
For consideration for **ConsenSys Academy’s 2018 - 2019 Developer Program Final Project**

### What is LAF?
A Solidity and React dApp to...
- Post lost items
- Find lost items near you & claim your ETH rewards

**The dApp's basic flow (for an item)**

![LAF Flow](docs/LAF_flow.jpg?raw=true)

1. Account A list an item in the registry - Lost status
2. Account B claims to have found item and set is to Potentially Found status. Along with this proof in the form of an image and details are submitted
3. Account A confirms or denies based on proof submitted. Confirming will change the item status to Confirmed Found - denying will revert to Lost status
4. The exchange is made based on details submitted in #3. Possible off-chain integration, or chat functionality such as using Whisper would likely have to be implemented here to avoid storing sensitive info on-chain
5. Account A confirms or denies the item has been recovered. Setting it to recovered will make reward ETH available to Account B for withdrawl

**IMPORTANT:** To test this flow you will need to use two separate accounts with a sufficient ETH balance for rewards and gas fees.

At time of writing, LAF only supports a **lost -> found -> return to owner** workflow. Most of the contract was written to *also* support a **found -> return to owner** workflow, but due to time constraints this has not been included/tested in the project.

---

### Running LAF
(On top of a local Ganache chain running on port 8545)

1. Clone this repo
2. In the root directory, run `ganache-cli` to start your local ganache chain
3. Still in the root directory, run `truffle migrate` to deploy contracts
4. From the `client` directory, ensure that all required npm packages are installed by running `npm install` 
5. From the `client` directory, run `npm run start` to start the local webserver. UI can then be accessed at [http://localhost:3000](http://localhost:3000)

---

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