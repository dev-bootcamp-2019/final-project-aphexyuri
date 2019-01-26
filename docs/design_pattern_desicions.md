# Design Pattern Decisions


### General
The most significant design decision to call out is the approach of enabling upgradability. this is achieved by completely separating the storage layer, making the logic layer (Item Registry) interchangeable/upgradable.

The 3 layers are:
- Registry + base contract(s)
- Library contract
- Storage contract

Interactions between these layers occurs as follows:

**Registry <-> Library <-> Storage**

### Upgradability
Various approaches to upgradability were considered, but ultimately decided on separation of storage and logic layers. Storage is maintained in a generic yet flexible key-value storage contract (`LAFItemStorage`), based on mappings of base data types. Write operations to the storage is restricted to a whitelist of `allowedSenders`.
Due to the generic nature of the storage mechanism, a large amount of accessor/mutator methods were required. This boilerplate code was mover to a library to be used by the main contract.

Using this approach, the view/presentation layer will never have to interact with the Storage layer. When an upgrade to logic (Registry) is required, the view layer can be swapped out (optionally the Library) and still interact with the same data stored in the Storage layer

### Withdrawl pattern
Pull-based transfer - gas payed by msg.sender

### Circuit breaker
Public facing contract extends OpenZeppelin's Pausable, providing contract pause/unpause functionality.


### Base Registry contract & inheritance
Current & future Registry contracts inherit from a base registry contract. Base contract contains key code/mechanism to be used by all registry contracts.

### Indexed Events
Extensive use of event with indexed parameters are used for item search and filtering functionality. In this case for geo (country, state/province) filtering of items.

### IPFS for off-chain data
Currently, images are uploaded to IPFS with hashes converted to multihashes in order to fit in bytes32 Solidity types (https://github.com/saurfang/ipfs-multihash-on-solidity). Future versions could see other item metadata off-chain in order to reduce gas costs associated with writing large string properties to the chain.

### Design Patterns not chosen
- Considered use of Inherited proxy pattern (as used with ZeppelinOS)
- Deployment of contact per item (likely still an option; each item will then have its own deployed contract via a factory, and will manage own funds etc)
- Escrow-based contracts with 2nd party pledges for increased actor integrity (to be re-evaluated for future versions of LAF)