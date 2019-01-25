# Design Pattern Decisions


### General
dApp consists of three layers:
- Registry + base contract(s)
- Library contract
- Storage contract

Interactions between these layers occurs as follows:

**Registry <-> Library <-> Storage**

### Circuit breaker
Public facing contract extends OpenZeppelin's Pausable, providing contract pause/unpause functionality.


### Upgradability
Various approaches to upgradability were considered, but ultimately decided on separation of storage and logic layers. Storage is maintained in a generic yet flexible key-value storage contract (`LAFAssetStorage`), based on mappings of base data types. Write operations to the storage is restricted to a whitelist of `allowedSenders`.
Due to the generic nature of the storage mechanism, a large amount of accessor/mutator methods were required. This boilerplate code was mover to a library to be used by the main contract.

**Registry <-> Library <-> Storage**

In the flow above, the view/presentation layer will never have to interact with the Storage layer. When an upgrade to logic etc is required, the view layer can be swapped out (optionally the Library) and still interact with the same data stored in the Storage layer. 

### Base Registry contract & inheritance
Current & future Registry contracts inherit from a base registry contract. Base contract contains key code/mechanism to be used by all registry contracts.

### Indexed Events
Item search functionality relies completely on events, filtering by indexed event properties. In this case for geo (country, state/province) filtering of items.

### IPFS for off-chain data
Currently, images are uploaded to IPFS with hashes converted to multihashes in order to fit in bytes32 Solidity types (https://github.com/saurfang/ipfs-multihash-on-solidity). Future versions could see other item metadata off-chain in order to reduce gas costs associated with writing large string properties to the chain.

### Design Patterns not chosen
- Considered use of Inherited proxy pattern (as used with ZeppelinOS)
- Deployment of contact per asset (likely still safer; each asset manages own funds etc)
- Escrow-based contracts with 2nd party pledges for increased actor integrity (to be re-evaluated for future versions of LAF)