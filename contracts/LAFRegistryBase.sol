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

    uint8 public version;

    // =======================================================
    // MODIFIERS
    // =======================================================
    modifier storageSet()
    {
        require(storageData.assetStorageAddress != address(0));
        _;
    }

    // =======================================================
    // CONSTRUCTOR
    // =======================================================
    constructor()
        public
    {
        // start in paused state
        pause();
    }

    // =======================================================
    // ADMIN
    // =======================================================
    function setAssetStorageAddress(address newStorageAddress)
        public
        onlyOwner
    {
        // set the address of asset storage contract
        storageData.assetStorageAddress = newStorageAddress;
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
    function getAssetStorageAddress()
        public
        view
        returns(address)
    {
        return storageData.assetStorageAddress;
    }
}