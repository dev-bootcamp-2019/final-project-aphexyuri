pragma solidity ^0.5.2;

// import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Ownable.sol"; // remix import

contract LAFRegistryBase is Ownable
{
    bool public _registryEnabled;
    address public storageAddress;
    
    event RegistryEnabled(address);
    event RegistryDisabled(address);
    
    modifier registryEnabled()
    {
        require(_registryEnabled);
        _;
    }
    
    modifier storageSet()
    {
        require(storageAddress != address(0));
        _;
    }
    
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
        storageAddress = newStorageAddress;
    }
}