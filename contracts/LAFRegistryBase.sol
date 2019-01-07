pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

import "./libraries/LAFStorageLib.sol";

contract LAFRegistryBase is Ownable
{
    using LAFStorageLib for LAFStorageLib.LibStorage;

    LAFStorageLib.LibStorage storageLibData;

    bool public _registryEnabled;
    
    event RegistryEnabled(address);
    event RegistryDisabled(address);

    // =======================================================
    // MODIFIERS
    // =======================================================
    modifier registryEnabled()
    {
        require(_registryEnabled);
        _;
    }
    
    modifier storageSet()
    {
        require(storageLibData.assetStorageAddress != address(0));
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
        return storageLibData.assetStorageAddress;
    }
    
    // =======================================================
    // ADMIN
    // =======================================================
    function enableRegistry()
        public
        onlyOwner
    {
        _registryEnabled = true;
        emit RegistryEnabled(address(this));
    }
    
    function disableRegistry()
        public
        onlyOwner
    {
        _registryEnabled = false;
        emit RegistryDisabled(address(this));
    }
    
    function setAssetStorageAddress(address newStorageAddress)
        public
        onlyOwner
    {
        // set the address of asset storage contract

        // TODO cleanup
        storageLibData.assetStorageAddress = newStorageAddress;
    }
}