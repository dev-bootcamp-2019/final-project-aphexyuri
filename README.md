# Lost and Found (LAF)
For consideration for **ConsenSys Academy’s 2018 - 2019 Developer Program Final Project**

__See the `docs` folder for supplementary docs__

### What is LAF?
A Solidity and React dApp that is a registry for lost items. This initial version is aimed at users that have lost personal items, and that wants to offer a reward for its retrieval. In short:
- Post lost items & offer ETH rewards
- Find lost items near you & claim your ETH rewards

**The dApp's basic flow (for an item)**

![LAF Flow](docs/LAF_flow.jpg?raw=true)

1. Account A list an item in the registry - Lost status
2. Account B claims to have found item and set is to Potentially Found status. Along with this proof in the form of an image and details are submitted
3. Account A confirms or denies based on proof submitted. Confirming will change the item status to Confirmed Found - denying will revert to Lost status
4. The exchange is made based on details submitted in #3. Possible off-chain integration, or chat functionality such as using Whisper would likely have to be implemented here to avoid storing sensitive info on-chain
5. Account A confirms or denies the item has been recovered. Setting it to recovered will make reward ETH available to Account B for withdrawl

### Additional documents
- [User Stories](https://github.com/aphexyuri/lost-and-found/blob/master/docs/avoiding_common_attacks.md)
- [Avoiding Common Attacks] (https://github.com/aphexyuri/lost-and-found/blob/master/docs/avoiding_common_attacks.md)
- [Design Pattern Desicions] (https://github.com/aphexyuri/lost-and-found/blob/master/docs/design_pattern_desicions.md)
- [Deployed Addresses] (https://github.com/aphexyuri/lost-and-found/blob/master/docs/deployed_addresses.txt)
- <a href="http://example.com/" target="_blank">Hello, world!</a>


**IMPORTANT:** To test this flow you will need to use two separate accounts with a sufficient ETH balance for rewards and gas fees. To obtain test ether for Ropsten visit:
- https://faucet.metamask.io/
- https://faucet.ropsten.be/

At time of writing, LAF only supports a **lost -> found -> return to owner** workflow. Most of the contract was written to *also* support a **found -> return to owner** workflow, but due to time constraints this has not been included/tested in the project.

---

### Dev environment
1. canache-cli v6.1.8
2. Node 8.11.0
3. Truffle v5.0.1
4. Solidity v0.5.0


### Running LAF
(Assume a local Ganache chain available on port 8545)

1. Clone this repo
2. In the root directory, run `npm install` to install npm dependencies
3. Still in the root directory, run `ganache-cli` to start your local ganache chain. Ideally, a block time of 30 seconds should be used (`ganache-cli --blockTime 30`)
4. In the same directory, run `truffle migrate --reset` to deploy contracts
4. `cd` to the `client` directory, ensure that all required npm packages are installed by running `npm install` 
5. Still in the `client` directory, run `npm run start` to start the local webserver. UI can then be accessed at [http://localhost:3000](http://localhost:3000)

---

### Key project notes

- Use of OpenZeppelin's contracts (Ownable, Pausable, SafeMath) - tried, tested & secure


### Tools & Resources
- IPFS multihash - https://github.com/saurfang/ipfs-multihash-on-solidity
- OpenZeppelin -https://github.com/OpenZeppelin/openzeppelin-solidity

---

Mirror repo cmds: `git fetch -p origin` -> `git push --mirror`