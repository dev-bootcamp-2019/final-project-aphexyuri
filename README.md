# Lost and Found (LAF)
For consideration for **ConsenSys Academy’s 2018 - 2019 Developer Program Final Project**

- Supplementary documents can be found in the `docs` folder or see the __Additional assignment documents__ section below for links
- ROPSTEN network Deployed dApp can be accessed at __http://laf.signalphire.com/__
- Contracts viewable at https://ropsten.etherscan.io/address/0x8f3b4dd1df14d5aec8c7a04350b49d3f61d821ca & https://ropsten.etherscan.io/address/0xFe62a3bbE9121BABEc021C09A27AD3F3ea871E02

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

### Additional assignment documents
- [User Stories](docs/LAF_User_Stories.docx)
- [Avoiding Common Attacks](docs/avoiding_common_attacks.md)
- [Design Pattern Desicions](docs/design_pattern_desicions.md)
- [Deployed Addresses](docs/deployed_addresses.txt)

---

### Dev environment
1. canache-cli v6.1.8
2. Node 8.11.0
3. Truffle v5.0.1
4. Solidity v0.5.0


### Running LAF locally
(Assume a local Ganache chain available on port 8545)

1. Clone this repo
2. In the root directory, run `npm install` to install npm dependencies
3. Still in the root directory, run `ganache-cli` to start your local ganache chain. Ideally, a block time of 30 seconds should be used (`ganache-cli --blockTime 30`)
4. In the same directory, run `truffle migrate --reset` to deploy contracts
4. `cd` to the `client` directory, ensure that all required npm packages are installed by running `npm install` 
5. Still in the `client` directory, run `npm run start` to start the local webserver. UI can then be accessed at [http://laf.signalphire.com](http://laf.signalphire.com)

---

### Project notes

- Due to time constraints, limited work was done on the UI accurately reflecting contract interactions. The closest example of how it is intended to work can be seen in the [I Lost Something](http://laf.signalphire.com/newlost) page; when you add a new item
- To test this flow you will need to use two separate accounts with a sufficient ETH balance for rewards and gas fees. To obtain test ether for Ropsten visit:
 - https://faucet.metamask.io/
 - https://faucet.ropsten.be/

- At time of writing, LAF only supports a **lost -> found -> return to owner** workflow. Most of the contract was written to *also* support a **found -> return to owner** workflow, but due to time constraints this has not been included/tested in the project

- Use of OpenZeppelin's contracts (Ownable, Pausable, SafeMath) - tried, tested & secure


### Tools & Resources
- IPFS multihash - https://github.com/saurfang/ipfs-multihash-on-solidity
- OpenZeppelin -https://github.com/OpenZeppelin/openzeppelin-solidity

### Built on
- Infura: IPFS interaction
- AWS: hosting
- UI: react, web3, react-redux, react-router, react-saga, react-thunk, , react-blockies, ipfs-http-client, semantic-ui-react

---

Mirror repo cmds: `git fetch -p origin` -> `git push --mirror`