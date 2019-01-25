pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
// import "./Pausable.sol"; // remix import

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// import "./SafeMath.sol"; // remix import

import "./libraries/LAFStorageLib.sol";

contract LAFRegistryBase is Ownable, Pausable
{
    using SafeMath for uint;
    using LAFStorageLib for LAFStorageLib.Data;
    
    LAFStorageLib.Data storageData;

    /// @dev version of service - set from registry
    uint8 public version;

    // =======================================================
    // MODIFIERS
    // =======================================================
    /// @dev ensures storage contract address is set
    modifier storageSet()
    {
        require(storageData.itemStorageAddress != address(0),
            "Storage note set");
        _;
    }

    // =======================================================
    // CONSTRUCTOR & FALLBACK
    // =======================================================
    constructor()
        public
    {
        // start in paused state
        pause();
    }

    function() external { revert(); }

    // =======================================================
    // ADMIN
    // =======================================================
    /// @dev Sets the address of the storage contract
    /// @param newStorageAddress address ofcontract
    function setItemStorageAddress(address newStorageAddress)
        public
        onlyOwner
    {
        // set the address of item storage contract
        storageData.itemStorageAddress = newStorageAddress;
    }

    /// @notice Will updated storage and transfer funds to new registry - use with caution. Old registry must be paused first
    /// @dev Method for 'upgrading' to a new registry
    /// @param newRegistryAddress Address of new deployed registry contract
    function updateRegistry(address payable newRegistryAddress)
        public
        onlyOwner
        whenPaused
    {
        // transfer funds to new regsitry instance
        newRegistryAddress.transfer(address(this).balance);
    }

    // =======================================================
    // PUBLIC API
    // =======================================================
    /// @dev Retrives the storage contract address
    /// @return address of storage contract
    function getItemStorageAddress()
        public
        view
        returns(address)
    {
        return storageData.itemStorageAddress;
    }
}