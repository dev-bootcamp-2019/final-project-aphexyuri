pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
// import "./Pausable.sol"; // remix import

import "./libraries/LAFStorageLib.sol";

contract LAFRegistryBase is Ownable, Pausable
{
    using LAFStorageLib for LAFStorageLib.Data;

    LAFStorageLib.Data storageData;

    // =======================================================
    // MODIFIERS
    // =======================================================
    modifier storageSet()
    {
        require(storageData.assetStorageAddress != address(0));
        _;
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
}