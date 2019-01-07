pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

contract LAFAssetStorage is Ownable
{
    address public registryAddress;
    
    mapping(bytes32 => uint256) internal uintStorage;
    mapping(bytes32 => string) internal stringStorage;
    mapping(bytes32 => address payable) internal addressStorage;
    mapping(bytes32 => bytes) internal bytesStorage;
    mapping(bytes32 => bool) internal boolStorage;
    mapping(bytes32 => int256) internal intStorage;
    
    modifier callerIsRegistryAddress()
    {
        require(registryAddress != address(0));
        require(msg.sender == registryAddress);
        _;
    }
    
    constructor()
        public
    {
        uintStorage[keccak256(KEY_ASSET_COUNT)] = 0;
    }
    
    function setAssetRegistryAddress(address newRegistryAddress)
        public
        onlyOwner
    {
        registryAddress = newRegistryAddress;
    }
    
    // =======================================================
    // KEY CONSTANTS
    // =======================================================
    bytes constant KEY_ASSET_COUNT = "assetCount";
    string constant KEY_TITLE = "title";
    string constant KEY_DESCRIPTION = "description";
    string constant KEY_ISO_COUNTRY_CODE = "isoCountryCode";
    string constant KEY_STATE_PROVINCE = "stateProvince";
    string constant KEY_CITY = "city";
    string constant KEY_REWARD = "reward";
    string constant KEY_CREATOR = "creator";
    string constant KEY_INITIAL_TYPE = "initialType";
    string constant KEY_STATUS = "status";
    string constant KEY_MATCHER = "matcher";
    string constant KEY_EXCHANGE_DEAILS = "exchangeDetails";
    
    // =======================================================
    // STORAGE MODIFIERS
    // =======================================================
    // ----- generic -----
    function storeUint256(uint256 assetId, string memory key, uint256 value)
        private
        callerIsRegistryAddress
    {
        uintStorage[keccak256(abi.encodePacked(assetId, key))] = value;
    }
    
    function storeString(uint256 assetId, string memory key, string memory value)
        private
        callerIsRegistryAddress
    {
        stringStorage[keccak256(abi.encodePacked(assetId, key))] = value;
    }
    
    function storeAddress(uint256 assetId, string memory key, address payable value)
        private
        callerIsRegistryAddress
    {
        addressStorage[keccak256(abi.encodePacked(assetId, key))] = value;
    }
    
    function storeBytes(uint256 assetId, string memory key, bytes memory value)
        private
        callerIsRegistryAddress
    {
        bytesStorage[keccak256(abi.encodePacked(assetId, key))] = value;
    }
    
    // ----- specific -----
    function incrementItemCount()
        public
        callerIsRegistryAddress
    {
        uint256 itemCount = getItemCount();
        itemCount++;
        uintStorage[keccak256(KEY_ASSET_COUNT)] = itemCount;
    }
    
    function storeAssetTitle(uint256 assetId, string memory value)
        public
        callerIsRegistryAddress
    {
        storeString(assetId, KEY_TITLE, value);
    }
    
    function storeAssetDescription(uint256 assetId, string memory value)
        public
        callerIsRegistryAddress
    {
        storeString(assetId, KEY_DESCRIPTION, value);
    }
    
    function storeAssetIsoCountryCode(uint256 assetId, bytes memory value)
        public
        callerIsRegistryAddress
    {
        storeBytes(assetId, KEY_ISO_COUNTRY_CODE, value);
    }
    
    function storeAssetStateProvince(uint256 assetId, bytes memory value)
        public
        callerIsRegistryAddress
    {
        storeBytes(assetId, KEY_STATE_PROVINCE, value);
    }
    
    function storeAssetCity(uint256 assetId, bytes memory value)
        public
        callerIsRegistryAddress
    {
        storeBytes(assetId, KEY_CITY, value);
    }
    
    function storeAssetReward(uint256 assetId, uint256 value)
        public
        callerIsRegistryAddress
    {
        storeUint256(assetId, KEY_REWARD, value);
    }
    
    function storeAssetCreator(uint256 assetId, address payable value)
        public
        callerIsRegistryAddress
    {
        storeAddress(assetId, KEY_CREATOR, value);
    }
    
    function storeAssetInitialType(uint256 assetId, uint value)
        public
        callerIsRegistryAddress
    {
        storeUint256(assetId, KEY_INITIAL_TYPE, value);
    }
    
    function storeAssetStatus(uint256 assetId, uint value)
        public
        callerIsRegistryAddress
    {
        storeUint256(assetId, KEY_STATUS, value);
    }
    
    function storeAssetMatcher(uint256 assetId, address payable value)
        public
        callerIsRegistryAddress
    {
        storeAddress(assetId, KEY_MATCHER, value);
    }
    
    function storeAssetExchangeDetails(uint256 assetId, string memory value)
        public
        callerIsRegistryAddress
    {
        storeString(assetId, KEY_EXCHANGE_DEAILS, value);
    }
    
    // =======================================================
    // STORAGE ACCESSORS
    // =======================================================
    // ----- generic -----
    function getUint256Value(uint256 assetId, string memory key)
        private
        view
        returns(uint256)
    {
         return uintStorage[keccak256(abi.encodePacked(assetId, key))];
    }
    
    function getStringValue(uint256 assetId, string memory key)
        private
        view
        returns(string memory)
    {
         return stringStorage[keccak256(abi.encodePacked(assetId, key))];
    }
    
    function getAddress(uint256 assetId, string memory key)
        private
        view
        returns(address payable)
    {
        return addressStorage[keccak256(abi.encodePacked(assetId, key))];
    }
    
    function getBytesValue(uint256 assetId, string memory key)
        private
        view
        returns(bytes memory)
    {
         return bytesStorage[keccak256(abi.encodePacked(assetId, key))];
    }
    
    // ----- specific -----
    function getItemCount()
        public
        view
        returns (uint256)
    {
        return uintStorage[keccak256(KEY_ASSET_COUNT)];
    }
    
    function getAssetTitle(uint256 assetId)
        public
        view
        returns (string memory)
    {
        return getStringValue(assetId, KEY_TITLE);
    }
    
    function getAssetDescription(uint256 assetId)
        public
        view
        returns (string memory)
    {
        return getStringValue(assetId, KEY_DESCRIPTION);
    }
    
    function getAssetIsoCountryCode(uint256 assetId)
        public
        view
        returns (bytes memory)
    {
        return getBytesValue(assetId, KEY_ISO_COUNTRY_CODE);
    }
    
    function getAssetStateProvince(uint256 assetId)
        public
        view
        returns (bytes memory)
    {
        return getBytesValue(assetId, KEY_STATE_PROVINCE);
    }
    
    function getAssetCity(uint256 assetId)
        public
        view
        returns (bytes memory)
    {
        return getBytesValue(assetId, KEY_CITY);
    }
    
    function getAssetReward(uint256 assetId)
        public
        view
        returns (uint256)
    {
        return getUint256Value(assetId, KEY_REWARD);
    }
    
    function getAssetCreator(uint256 assetId)
        public
        view
        returns (address payable)
    {
        return getAddress(assetId, KEY_CREATOR);
    }
    
    function getAssetInitialType(uint256 assetId)
        public
        view
        returns(uint256)
    {
        return getUint256Value(assetId, KEY_INITIAL_TYPE);
    }
    
    function getAssetStatus(uint256 assetId)
        public
        view
        returns(uint256)
    {
        return getUint256Value(assetId, KEY_STATUS);
    }
    
    function getAssetMatcher(uint256 assetId)
        public
        view
        returns (address payable)
    {
        return getAddress(assetId, KEY_MATCHER);
    }
}