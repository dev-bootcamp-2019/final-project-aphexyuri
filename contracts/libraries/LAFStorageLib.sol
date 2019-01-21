pragma solidity ^0.5.0;

import "../LAFAssetStorage.sol";

library LAFStorageLib
{
    struct Counter { uint i; }

    struct Data
    {
        address assetStorageAddress;
        address payable rewardsBankAddress;
    }

    // =======================================================
    // KEY CONSTANTS
    // =======================================================
    bytes constant KEY_ASSET_COUNT = "assetCount";
    string constant KEY_CLAIMABLE_REWARDS_LEDGER = "claimableRewardsLedger";

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

    string constant KEY_EXCHANGE_DETAILS = "exchangeDetails";
    string constant KEY_FOUND_DETAILS = "foundDetails";
    
    string constant KEY_IPFS_DIGEST_PRIMARY = "ipfsDigestPrimary";
    string constant KEY_IPFS_HASH_FUNCTION_PRIMARY = "ipfsHashFunctionPrimary";
    string constant KEY_IPFS_SIZE_PRIMARY = "ipfsSziePrimary";

    string constant KEY_IPFS_DIGEST_SECONDARY = "ipfsDigestSecondary";
    string constant KEY_IPFS_HASH_FUNCTION_SECONDARY = "ipfsHashFunctionSecondary";
    string constant KEY_IPFS_SIZE_SECONDARY = "ipfsSizeSecondary";

    string constant KEY_MY_LAF_STORAGE = "myLafStorage";

    // =======================================================
    // STORAGE MUTATORS
    // =======================================================
    // ----- generic -----
    function storeUint8(address assetStorageAddress, uint256 assetId, string memory key, uint8 value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeUint8(keccak256(abi.encodePacked(assetId, key)), value);
    }

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

    function storeBytes8(address assetStorageAddress, uint256 assetId, string memory key, bytes8 value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeBytes8(keccak256(abi.encodePacked(assetId, key)), value);
    }

    function storeBytes16(address assetStorageAddress, uint256 assetId, string memory key, bytes16 value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeBytes16(keccak256(abi.encodePacked(assetId, key)), value);
    }

    function storeBytes32(address assetStorageAddress, uint256 assetId, string memory key, bytes32 value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeBytes32(keccak256(abi.encodePacked(assetId, key)), value);
    }

    function storeBool(address assetStorageAddress, uint256 assetId, string memory key, bool value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeBool(keccak256(abi.encodePacked(assetId, key)), value);
    }

    function storeInt256(address assetStorageAddress, uint256 assetId, string memory key, int256 value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeInt256(keccak256(abi.encodePacked(assetId, key)), value);
    }

    function storeAddressUint256Mapping(address assetStorageAddress, string memory key, address addressValue, uint256 uint256Value)
        private
    {
        LAFAssetStorage(assetStorageAddress).storeAddressUint256Mapping(keccak256(abi.encode(key)), addressValue, uint256Value);
    }

    // function storeAddressUint256ArrayMapping(address assetStorageAddress, string memory key, address addressValue, uint256[] memory uint256ArrayValue)
    //     private
    // {
    //     LAFAssetStorage(assetStorageAddress).storeAddressUint256ArrayMapping(keccak256(abi.encode(key)), addressValue, uint256ArrayValue);
    // }
    
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
    
    function storeAssetIsoCountryCode(address assetStorageAddress, uint256 assetId, bytes8 value)
        public
    {
        storeBytes8(assetStorageAddress, assetId, KEY_ISO_COUNTRY_CODE, value);
    }
    
    function storeAssetStateProvince(address assetStorageAddress, uint256 assetId, bytes8 value)
        public
    {
        storeBytes8(assetStorageAddress, assetId, KEY_STATE_PROVINCE, value);
    }
    
    function storeAssetCity(address assetStorageAddress, uint256 assetId, bytes32 value)
        public
    {
        storeBytes32(assetStorageAddress, assetId, KEY_CITY, value);
    }
    
    function storeAssetReward(address assetStorageAddress, uint256 assetId, uint256 value)
        public
    {
        storeUint256(assetStorageAddress, assetId, KEY_REWARD, value);
    }
    
    function storeAssetCreator(address assetStorageAddress, uint256 assetId, address payable value)
        public
    {
        require(value != address(0));
        storeAddress(assetStorageAddress, assetId, KEY_CREATOR, value);
    }
    
    function storeAssetInitialType(address assetStorageAddress, uint256 assetId, uint8 value)
        public
    {
        storeUint8(assetStorageAddress, assetId, KEY_INITIAL_TYPE, value);
    }
    
    function storeAssetStatus(address assetStorageAddress, uint256 assetId, uint8 value)
        public
    {
        storeUint8(assetStorageAddress, assetId, KEY_STATUS, value);
    }
    
    function storeAssetMatcher(address assetStorageAddress, uint256 assetId, address payable value)
        public
    {
        storeAddress(assetStorageAddress, assetId, KEY_MATCHER, value);
    }
    
    function storeAssetExchangeDetails(address assetStorageAddress, uint256 assetId, string memory value)
        public
    {
        storeString(assetStorageAddress, assetId, KEY_EXCHANGE_DETAILS, value);
    }

    function storeClaimableReward(address assetStorageAddress, address recipient, uint256 rewardAmount)
        public
    {
        require(recipient != address(0));
        storeAddressUint256Mapping(assetStorageAddress, KEY_CLAIMABLE_REWARDS_LEDGER, recipient, rewardAmount);
    }

    function storeAssetIfsDigest(address assetStorageAddress, uint256 assetId, bool primary, bytes32 value)
        public
    {
        if(primary) {
            storeBytes32(assetStorageAddress, assetId, KEY_IPFS_DIGEST_PRIMARY, value);
        }
        else {
            storeBytes32(assetStorageAddress, assetId, KEY_IPFS_DIGEST_SECONDARY, value);
        }
    }

    function storeAssetIfsHashFunction(address assetStorageAddress, uint256 assetId, bool primary, uint8 value)
        public
    {
        if(primary) {
            storeUint8(assetStorageAddress, assetId, KEY_IPFS_HASH_FUNCTION_PRIMARY, value);
        }
        else {
            storeUint8(assetStorageAddress, assetId, KEY_IPFS_HASH_FUNCTION_SECONDARY, value);
        }
    }

    function storeAssetIfsSize(address assetStorageAddress, uint256 assetId, bool primary, uint8 value)
        public
    {
        if(primary) {
            storeUint8(assetStorageAddress, assetId, KEY_IPFS_SIZE_PRIMARY, value);
        }
        else {
            storeUint8(assetStorageAddress, assetId, KEY_IPFS_SIZE_SECONDARY, value);
        }
    }

    function storeAssetFoundDetails(address assetStorageAddress, uint256 assetId, string memory value)
        public
    {
        storeString(assetStorageAddress, assetId, KEY_FOUND_DETAILS, value);
    }

    function storeToMyLAFs(address assetStorageAddress, address userAddress, uint256 value)
        public
    {
        LAFAssetStorage(assetStorageAddress).pushUint256ToAddressUint256Mapping(keccak256(abi.encode(KEY_MY_LAF_STORAGE)), userAddress, value);
    }

    // =======================================================
    // STORAGE ACCESSORS
    // =======================================================
    // ----- generic -----
    function getUint8Value(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(uint8)
    {
        return LAFAssetStorage(assetStorageAddress).uint8Storage(keccak256(abi.encodePacked(assetId, key)));
    }

    function getUint256Value(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(uint256)
    {
        return LAFAssetStorage(assetStorageAddress).uint256Storage(keccak256(abi.encodePacked(assetId, key)));
    }
    
    function getStringValue(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(string memory)
    {
        return LAFAssetStorage(assetStorageAddress).stringStorage(keccak256(abi.encodePacked(assetId, key)));
    }
    
    function getAddressValue(address assetStorageAddress, uint256 assetId, string memory key)
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

    function getBytes8Value(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(bytes8)
    {
        return LAFAssetStorage(assetStorageAddress).bytes8Storage(keccak256(abi.encodePacked(assetId, key)));
    }

    function getBytes16Value(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(bytes16)
    {
        return LAFAssetStorage(assetStorageAddress).bytes16Storage(keccak256(abi.encodePacked(assetId, key)));
    }

    function getBytes32Value(address assetStorageAddress, uint256 assetId, string memory key)
        private
        view
        returns(bytes32)
    {
        return LAFAssetStorage(assetStorageAddress).bytes32Storage(keccak256(abi.encodePacked(assetId, key)));
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
        returns(int256)
    {
        return LAFAssetStorage(assetStorageAddress).int256Storage(keccak256(abi.encodePacked(assetId, key)));
    }

    function getUint256ForAddressFromMapping(address assetStorageAddress, string memory mappingKey, address addressValue)
        private
        view
        returns(uint256)
    {
        return LAFAssetStorage(assetStorageAddress).addressUint256MappingStore(keccak256(abi.encode(mappingKey)), addressValue);
    }

    // function getUint256ArrayForAddressFromMapping(address assetStorageAddress, string memory mappingKey, address addressValue)
    //     private
    //     view
    //     returns(uint256[] memory)
    // {
    //     return LAFAssetStorage(assetStorageAddress).getUint256ArrayForAddressFromMapping(keccak256(abi.encode(mappingKey)), addressValue);
    // }
    
    // ----- specific -----
    function getAssetCount(address assetStorageAddress)
        public
        view
        returns (uint256)
    {
        return LAFAssetStorage(assetStorageAddress).uint256Storage(keccak256(KEY_ASSET_COUNT));
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
        returns (bytes8)
    {
        return getBytes8Value(assetStorageAddress, assetId, KEY_ISO_COUNTRY_CODE);
    }
    
    function getAssetStateProvince(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (bytes8)
    {
        return getBytes8Value(assetStorageAddress, assetId, KEY_STATE_PROVINCE);
    }
    
    function getAssetCity(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (bytes32)
    {
        return getBytes32Value(assetStorageAddress, assetId, KEY_CITY);
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
        return getAddressValue(assetStorageAddress, assetId, KEY_CREATOR);
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
        returns(uint8)
    {
        return getUint8Value(assetStorageAddress, assetId, KEY_STATUS);
    }
    
    function getAssetMatcher(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (address payable)
    {
        return getAddressValue(assetStorageAddress, assetId, KEY_MATCHER);
    }

    function getExchangeDetails(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (string memory)
    {
        return getStringValue(assetStorageAddress, assetId, KEY_EXCHANGE_DETAILS);
    }

    function getClaimableReward(address assetStorageAddress, address claimer)
        public
        view
        returns(uint256)
    {
        return getUint256ForAddressFromMapping(assetStorageAddress, KEY_CLAIMABLE_REWARDS_LEDGER, claimer);
    }
    

    function getAssetIpfsDigest(address assetStorageAddress, uint256 assetId, bool primary)
        public
        view
        returns (bytes32)
    {
        if(primary) {
            return getBytes32Value(assetStorageAddress, assetId, KEY_IPFS_DIGEST_PRIMARY);
        }
        else {
            return getBytes32Value(assetStorageAddress, assetId, KEY_IPFS_DIGEST_SECONDARY);
        }
    }

    function getAssetIpfsHashFunction(address assetStorageAddress, uint256 assetId, bool primary)
        public
        view
        returns (uint8)
    {
        if(primary) {
            return getUint8Value(assetStorageAddress, assetId, KEY_IPFS_HASH_FUNCTION_PRIMARY);
        }
        else {
            return getUint8Value(assetStorageAddress, assetId, KEY_IPFS_HASH_FUNCTION_SECONDARY);
        }
    }

    function getAssetIpfsSize(address assetStorageAddress, uint256 assetId, bool primary)
        public
        view
        returns (uint8)
    {
        if(primary) {
            return getUint8Value(assetStorageAddress, assetId, KEY_IPFS_SIZE_PRIMARY);
        }
        else {
            return getUint8Value(assetStorageAddress, assetId, KEY_IPFS_SIZE_SECONDARY);
        }
    }

    function getAssetFoundDetails(address assetStorageAddress, uint256 assetId)
        public
        view
        returns (string memory)
    {
        return getStringValue(assetStorageAddress, assetId, KEY_FOUND_DETAILS);
    }

    function getMyLAFs(address assetStorageAddress, address userAddress)
        public
        view
        returns (uint256[] memory)
    {
        return LAFAssetStorage(assetStorageAddress).getUint256ArrayForAddressFromMapping(keccak256(abi.encode(KEY_MY_LAF_STORAGE)), userAddress);
    }
}