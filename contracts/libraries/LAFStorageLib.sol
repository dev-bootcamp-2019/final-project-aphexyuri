pragma solidity ^0.5.0;

import "../LAFAssetStorage.sol";

library LAFStorageLib
{
    struct Counter { uint i; }

    struct LibStorage
    {
        address assetStorageAddress;
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
    function storeUint256(address assetStorageAddress, uint256 assetId, string memory key, uint256 value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeUint256(keccak256(abi.encodePacked(assetId, key)), value);
    }
    
    function storeString(address assetStorageAddress, uint256 assetId, string memory key, string memory value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeString(keccak256(abi.encodePacked(assetId, key)), value);
    }
    
    function storeAddress(address assetStorageAddress, uint256 assetId, string memory key, address payable value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeAddress(keccak256(abi.encodePacked(assetId, key)), value);
    }
    
    function storeBytes(address assetStorageAddress, uint256 assetId, string memory key, bytes memory value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeBytes(keccak256(abi.encodePacked(assetId, key)), value);
    }

    function storeBool(address assetStorageAddress, uint256 assetId, string memory key, bool value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeBool(keccak256(abi.encodePacked(assetId, key)), value);
    }

    function storeInt256(address assetStorageAddress, uint256 assetId, string memory key, int value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeInt256(keccak256(abi.encodePacked(assetId, key)), value);
    }
    
    // ----- specific -----
    function setInitialAssetCount(address assetStorageAddress)
        public
    {
        LAFAssetStorage(assetStorageAddress).storeUint256(keccak256(KEY_ASSET_COUNT), 0);
    }

    function incrementAssetCount(address assetStorageAddress)
        public
    {
        uint256 assetCount = getAssetCount(assetStorageAddress);
        assetCount++;
        LAFAssetStorage(assetStorageAddress).storeUint256(keccak256(KEY_ASSET_COUNT), assetCount);
    }
    
    function storeAssetTitle(address assetStorageAddress, uint256 assetId, string memory value)
        public
    {
        storeString(assetStorageAddress, assetId, KEY_TITLE, value);
    }
    
    function storeAssetDescription(address assetStorageAddress, uint256 assetId, string memory value)
        public
    {
        storeString(assetStorageAddress, assetId, KEY_DESCRIPTION, value);
    }
    
    function storeAssetIsoCountryCode(address assetStorageAddress, uint256 assetId, bytes memory value)
        public
    {
        storeBytes(assetStorageAddress, assetId, KEY_ISO_COUNTRY_CODE, value);
    }
    
    function storeAssetStateProvince(address assetStorageAddress, uint256 assetId, bytes memory value)
        public
    {
        storeBytes(assetStorageAddress, assetId, KEY_STATE_PROVINCE, value);
    }
    
    function storeAssetCity(address assetStorageAddress, uint256 assetId, bytes memory value)
        public
    {
        storeBytes(assetStorageAddress, assetId, KEY_CITY, value);
    }
    
    function storeAssetReward(address assetStorageAddress, uint256 assetId, uint256 value)
        public
    {
        storeUint256(assetStorageAddress, assetId, KEY_REWARD, value);
    }
    
    function storeAssetCreator(address assetStorageAddress, uint256 assetId, address payable value)
        public
    {
        storeAddress(assetStorageAddress, assetId, KEY_CREATOR, value);
    }
    
    function storeAssetInitialType(address assetStorageAddress, uint256 assetId, uint value)
        public
    {
        storeUint256(assetStorageAddress, assetId, KEY_INITIAL_TYPE, value);
    }
    
    function storeAssetStatus(address assetStorageAddress, uint256 assetId, uint value)
        public
    {
        storeUint256(assetStorageAddress, assetId, KEY_STATUS, value);
    }
    
    function storeAssetMatcher(address assetStorageAddress, uint256 assetId, address payable value)
        public
    {
        storeAddress(assetStorageAddress, assetId, KEY_MATCHER, value);
    }
    
    function storeAssetExchangeDetails(address assetStorageAddress, uint256 assetId, string memory value)
        public
    {
        storeString(assetStorageAddress, assetId, KEY_EXCHANGE_DEAILS, value);
    }

    // =======================================================
    // STORAGE ACCESSORS
    // =======================================================
    // ----- generic -----
    function getUint256Value(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(uint256)
    {
        return LAFAssetStorage(assetStorageAddress).uintStorage(keccak256(abi.encodePacked(assetId, key)));
    }
    
    function getStringValue(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(string memory)
    {
        return LAFAssetStorage(assetStorageAddress).stringStorage(keccak256(abi.encodePacked(assetId, key)));
    }
    
    function getAddress(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(address payable)
    {
        return LAFAssetStorage(assetStorageAddress).addressStorage(keccak256(abi.encodePacked(assetId, key)));
    }
    
    function getBytesValue(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(bytes memory)
    {
        return LAFAssetStorage(assetStorageAddress).bytesStorage(keccak256(abi.encodePacked(assetId, key)));
    }

    function getBoolValue(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(bool)
    {
        return LAFAssetStorage(assetStorageAddress).boolStorage(keccak256(abi.encodePacked(assetId, key)));
    }

    function getInt256Value(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(int)
    {
        return LAFAssetStorage(assetStorageAddress).intStorage(keccak256(abi.encodePacked(assetId, key)));
    }
    
    // ----- specific -----
    function getAssetCount(address assetStorageAddress)
        public
        view
        returns (uint256)
    {
        return LAFAssetStorage(assetStorageAddress).uintStorage(keccak256(KEY_ASSET_COUNT));
    }
    
    function getAssetTitle(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (string memory)
    {
        return getStringValue(assetStorageAddress, assetId, KEY_TITLE);
    }
    
    function getAssetDescription(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (string memory)
    {
        return getStringValue(assetStorageAddress, assetId, KEY_DESCRIPTION);
    }
    
    function getAssetIsoCountryCode(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (bytes memory)
    {
        return getBytesValue(assetStorageAddress, assetId, KEY_ISO_COUNTRY_CODE);
    }
    
    function getAssetStateProvince(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (bytes memory)
    {
        return getBytesValue(assetStorageAddress, assetId, KEY_STATE_PROVINCE);
    }
    
    function getAssetCity(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (bytes memory)
    {
        return getBytesValue(assetStorageAddress, assetId, KEY_CITY);
    }
    
    function getAssetReward(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (uint256)
    {
        return getUint256Value(assetStorageAddress, assetId, KEY_REWARD);
    }
    
    function getAssetCreator(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (address payable)
    {
        return getAddress(assetStorageAddress, assetId, KEY_CREATOR);
    }
    
    function getAssetInitialType(address assetStorageAddress, uint256 assetId)
        public
        view
        returns(uint256)
    {
        return getUint256Value(assetStorageAddress, assetId, KEY_INITIAL_TYPE);
    }
    
    function getAssetStatus(address assetStorageAddress, uint256 assetId)
        public
        view
        returns(uint256)
    {
        return getUint256Value(assetStorageAddress, assetId, KEY_STATUS);
    }
    
    function getAssetMatcher(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (address payable)
    {
        return getAddress(assetStorageAddress, assetId, KEY_MATCHER);
    }
}