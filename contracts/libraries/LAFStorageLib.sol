pragma solidity ^0.5.0;

import "../LAFItemStorage.sol";

library LAFStorageLib
{
    struct Counter { uint i; }

    struct Data
    {
        address itemStorageAddress;
    }

    // =======================================================
    // KEY CONSTANTS
    // =======================================================
    bytes constant KEY_ASSET_COUNT = "itemCount";
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
    function storeUint8(address itemStorageAddress, uint256 itemId, string memory key, uint8 value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeUint8(keccak256(abi.encodePacked(itemId, key)), value);
    }

    function storeUint256(address itemStorageAddress, uint256 itemId, string memory key, uint256 value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeUint256(keccak256(abi.encodePacked(itemId, key)), value);
    }
    
    function storeString(address itemStorageAddress, uint256 itemId, string memory key, string memory value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeString(keccak256(abi.encodePacked(itemId, key)), value);
    }
    
    function storeAddress(address itemStorageAddress, uint256 itemId, string memory key, address payable value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeAddress(keccak256(abi.encodePacked(itemId, key)), value);
    }
    
    function storeBytes(address itemStorageAddress, uint256 itemId, string memory key, bytes memory value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeBytes(keccak256(abi.encodePacked(itemId, key)), value);
    }

    function storeBytes8(address itemStorageAddress, uint256 itemId, string memory key, bytes8 value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeBytes8(keccak256(abi.encodePacked(itemId, key)), value);
    }

    function storeBytes16(address itemStorageAddress, uint256 itemId, string memory key, bytes16 value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeBytes16(keccak256(abi.encodePacked(itemId, key)), value);
    }

    function storeBytes32(address itemStorageAddress, uint256 itemId, string memory key, bytes32 value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeBytes32(keccak256(abi.encodePacked(itemId, key)), value);
    }

    function storeBool(address itemStorageAddress, uint256 itemId, string memory key, bool value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeBool(keccak256(abi.encodePacked(itemId, key)), value);
    }

    function storeInt256(address itemStorageAddress, uint256 itemId, string memory key, int256 value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeInt256(keccak256(abi.encodePacked(itemId, key)), value);
    }

    function storeAddressUint256Mapping(address itemStorageAddress, string memory key, address addressValue, uint256 uint256Value)
        private
    {
        LAFItemStorage(itemStorageAddress).storeAddressUint256Mapping(keccak256(abi.encode(key)), addressValue, uint256Value);
    }

    // function storeAddressUint256ArrayMapping(address itemStorageAddress, string memory key, address addressValue, uint256[] memory uint256ArrayValue)
    //     private
    // {
    //     LAFItemStorage(itemStorageAddress).storeAddressUint256ArrayMapping(keccak256(abi.encode(key)), addressValue, uint256ArrayValue);
    // }
    
    // ----- specific -----
    function setInitialItemCount(address itemStorageAddress)
        public
    {
        LAFItemStorage(itemStorageAddress).storeUint256(keccak256(KEY_ASSET_COUNT), 0);
    }

    function incrementItemCount(address itemStorageAddress)
        public
    {
        uint256 itemCount = getItemCount(itemStorageAddress);
        itemCount++;
        LAFItemStorage(itemStorageAddress).storeUint256(keccak256(KEY_ASSET_COUNT), itemCount);
    }
    
    function storeItemTitle(address itemStorageAddress, uint256 itemId, string memory value)
        public
    {
        storeString(itemStorageAddress, itemId, KEY_TITLE, value);
    }
    
    function storeItemDescription(address itemStorageAddress, uint256 itemId, string memory value)
        public
    {
        storeString(itemStorageAddress, itemId, KEY_DESCRIPTION, value);
    }
    
    function storeItemIsoCountryCode(address itemStorageAddress, uint256 itemId, bytes8 value)
        public
    {
        storeBytes8(itemStorageAddress, itemId, KEY_ISO_COUNTRY_CODE, value);
    }
    
    function storeItemStateProvince(address itemStorageAddress, uint256 itemId, bytes8 value)
        public
    {
        storeBytes8(itemStorageAddress, itemId, KEY_STATE_PROVINCE, value);
    }
    
    function storeItemCity(address itemStorageAddress, uint256 itemId, bytes32 value)
        public
    {
        storeBytes32(itemStorageAddress, itemId, KEY_CITY, value);
    }
    
    function storeItemReward(address itemStorageAddress, uint256 itemId, uint256 value)
        public
    {
        storeUint256(itemStorageAddress, itemId, KEY_REWARD, value);
    }
    
    function storeItemCreator(address itemStorageAddress, uint256 itemId, address payable value)
        public
    {
        require(value != address(0));
        storeAddress(itemStorageAddress, itemId, KEY_CREATOR, value);
    }
    
    function storeItemInitialType(address itemStorageAddress, uint256 itemId, uint8 value)
        public
    {
        storeUint8(itemStorageAddress, itemId, KEY_INITIAL_TYPE, value);
    }
    
    function storeItemStatus(address itemStorageAddress, uint256 itemId, uint8 value)
        public
    {
        storeUint8(itemStorageAddress, itemId, KEY_STATUS, value);
    }
    
    function storeItemMatcher(address itemStorageAddress, uint256 itemId, address payable value)
        public
    {
        storeAddress(itemStorageAddress, itemId, KEY_MATCHER, value);
    }
    
    function storeItemExchangeDetails(address itemStorageAddress, uint256 itemId, string memory value)
        public
    {
        storeString(itemStorageAddress, itemId, KEY_EXCHANGE_DETAILS, value);
    }

    function storeClaimableReward(address itemStorageAddress, address recipient, uint256 rewardAmount)
        public
    {
        require(recipient != address(0));
        storeAddressUint256Mapping(itemStorageAddress, KEY_CLAIMABLE_REWARDS_LEDGER, recipient, rewardAmount);
    }

    function storeItemIfsDigest(address itemStorageAddress, uint256 itemId, bool primary, bytes32 value)
        public
    {
        if(primary) {
            storeBytes32(itemStorageAddress, itemId, KEY_IPFS_DIGEST_PRIMARY, value);
        }
        else {
            storeBytes32(itemStorageAddress, itemId, KEY_IPFS_DIGEST_SECONDARY, value);
        }
    }

    function storeItemIfsHashFunction(address itemStorageAddress, uint256 itemId, bool primary, uint8 value)
        public
    {
        if(primary) {
            storeUint8(itemStorageAddress, itemId, KEY_IPFS_HASH_FUNCTION_PRIMARY, value);
        }
        else {
            storeUint8(itemStorageAddress, itemId, KEY_IPFS_HASH_FUNCTION_SECONDARY, value);
        }
    }

    function storeItemIfsSize(address itemStorageAddress, uint256 itemId, bool primary, uint8 value)
        public
    {
        if(primary) {
            storeUint8(itemStorageAddress, itemId, KEY_IPFS_SIZE_PRIMARY, value);
        }
        else {
            storeUint8(itemStorageAddress, itemId, KEY_IPFS_SIZE_SECONDARY, value);
        }
    }

    function storeItemFoundDetails(address itemStorageAddress, uint256 itemId, string memory value)
        public
    {
        storeString(itemStorageAddress, itemId, KEY_FOUND_DETAILS, value);
    }

    function storeToMyLAFs(address itemStorageAddress, address userAddress, uint256 value)
        public
    {
        LAFItemStorage(itemStorageAddress).pushUint256ToAddressUint256Mapping(keccak256(abi.encode(KEY_MY_LAF_STORAGE)), userAddress, value);
    }

    // =======================================================
    // STORAGE ACCESSORS
    // =======================================================
    // ----- generic -----
    function getUint8Value(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(uint8)
    {
        return LAFItemStorage(itemStorageAddress).uint8Storage(keccak256(abi.encodePacked(itemId, key)));
    }

    function getUint256Value(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(uint256)
    {
        return LAFItemStorage(itemStorageAddress).uint256Storage(keccak256(abi.encodePacked(itemId, key)));
    }
    
    function getStringValue(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(string memory)
    {
        return LAFItemStorage(itemStorageAddress).stringStorage(keccak256(abi.encodePacked(itemId, key)));
    }
    
    function getAddressValue(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(address payable)
    {
        return LAFItemStorage(itemStorageAddress).addressStorage(keccak256(abi.encodePacked(itemId, key)));
    }
    
    function getBytesValue(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(bytes memory)
    {
        return LAFItemStorage(itemStorageAddress).bytesStorage(keccak256(abi.encodePacked(itemId, key)));
    }

    function getBytes8Value(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(bytes8)
    {
        return LAFItemStorage(itemStorageAddress).bytes8Storage(keccak256(abi.encodePacked(itemId, key)));
    }

    function getBytes16Value(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(bytes16)
    {
        return LAFItemStorage(itemStorageAddress).bytes16Storage(keccak256(abi.encodePacked(itemId, key)));
    }

    function getBytes32Value(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(bytes32)
    {
        return LAFItemStorage(itemStorageAddress).bytes32Storage(keccak256(abi.encodePacked(itemId, key)));
    }

    function getBoolValue(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(bool)
    {
        return LAFItemStorage(itemStorageAddress).boolStorage(keccak256(abi.encodePacked(itemId, key)));
    }

    function getInt256Value(address itemStorageAddress, uint256 itemId, string memory key)
        private
        view
        returns(int256)
    {
        return LAFItemStorage(itemStorageAddress).int256Storage(keccak256(abi.encodePacked(itemId, key)));
    }

    function getUint256ForAddressFromMapping(address itemStorageAddress, string memory mappingKey, address addressValue)
        private
        view
        returns(uint256)
    {
        return LAFItemStorage(itemStorageAddress).addressUint256MappingStore(keccak256(abi.encode(mappingKey)), addressValue);
    }

    // function getUint256ArrayForAddressFromMapping(address itemStorageAddress, string memory mappingKey, address addressValue)
    //     private
    //     view
    //     returns(uint256[] memory)
    // {
    //     return LAFItemStorage(itemStorageAddress).getUint256ArrayForAddressFromMapping(keccak256(abi.encode(mappingKey)), addressValue);
    // }
    
    // ----- specific -----
    function getItemCount(address itemStorageAddress)
        public
        view
        returns (uint256)
    {
        return LAFItemStorage(itemStorageAddress).uint256Storage(keccak256(KEY_ASSET_COUNT));
    }
    
    function getItemTitle(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (string memory)
    {
        return getStringValue(itemStorageAddress, itemId, KEY_TITLE);
    }
    
    function getItemDescription(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (string memory)
    {
        return getStringValue(itemStorageAddress, itemId, KEY_DESCRIPTION);
    }
    
    function getItemIsoCountryCode(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (bytes8)
    {
        return getBytes8Value(itemStorageAddress, itemId, KEY_ISO_COUNTRY_CODE);
    }
    
    function getItemStateProvince(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (bytes8)
    {
        return getBytes8Value(itemStorageAddress, itemId, KEY_STATE_PROVINCE);
    }
    
    function getItemCity(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (bytes32)
    {
        return getBytes32Value(itemStorageAddress, itemId, KEY_CITY);
    }
    
    function getItemReward(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (uint256)
    {
        return getUint256Value(itemStorageAddress, itemId, KEY_REWARD);
    }
    
    function getItemCreator(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (address payable)
    {
        return getAddressValue(itemStorageAddress, itemId, KEY_CREATOR);
    }
    
    function getItemInitialType(address itemStorageAddress, uint256 itemId)
        public
        view
        returns(uint256)
    {
        return getUint256Value(itemStorageAddress, itemId, KEY_INITIAL_TYPE);
    }
    
    function getItemStatus(address itemStorageAddress, uint256 itemId)
        public
        view
        returns(uint8)
    {
        return getUint8Value(itemStorageAddress, itemId, KEY_STATUS);
    }
    
    function getItemMatcher(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (address payable)
    {
        return getAddressValue(itemStorageAddress, itemId, KEY_MATCHER);
    }

    function getExchangeDetails(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (string memory)
    {
        return getStringValue(itemStorageAddress, itemId, KEY_EXCHANGE_DETAILS);
    }

    function getClaimableReward(address itemStorageAddress, address claimer)
        public
        view
        returns(uint256)
    {
        return getUint256ForAddressFromMapping(itemStorageAddress, KEY_CLAIMABLE_REWARDS_LEDGER, claimer);
    }
    

    function getItemIpfsDigest(address itemStorageAddress, uint256 itemId, bool primary)
        public
        view
        returns (bytes32)
    {
        if(primary) {
            return getBytes32Value(itemStorageAddress, itemId, KEY_IPFS_DIGEST_PRIMARY);
        }
        else {
            return getBytes32Value(itemStorageAddress, itemId, KEY_IPFS_DIGEST_SECONDARY);
        }
    }

    function getItemIpfsHashFunction(address itemStorageAddress, uint256 itemId, bool primary)
        public
        view
        returns (uint8)
    {
        if(primary) {
            return getUint8Value(itemStorageAddress, itemId, KEY_IPFS_HASH_FUNCTION_PRIMARY);
        }
        else {
            return getUint8Value(itemStorageAddress, itemId, KEY_IPFS_HASH_FUNCTION_SECONDARY);
        }
    }

    function getItemIpfsSize(address itemStorageAddress, uint256 itemId, bool primary)
        public
        view
        returns (uint8)
    {
        if(primary) {
            return getUint8Value(itemStorageAddress, itemId, KEY_IPFS_SIZE_PRIMARY);
        }
        else {
            return getUint8Value(itemStorageAddress, itemId, KEY_IPFS_SIZE_SECONDARY);
        }
    }

    function getItemFoundDetails(address itemStorageAddress, uint256 itemId)
        public
        view
        returns (string memory)
    {
        return getStringValue(itemStorageAddress, itemId, KEY_FOUND_DETAILS);
    }

    function getMyLAFs(address itemStorageAddress, address userAddress)
        public
        view
        returns (uint256[] memory)
    {
        return LAFItemStorage(itemStorageAddress).getUint256ArrayForAddressFromMapping(keccak256(abi.encode(KEY_MY_LAF_STORAGE)), userAddress);
    }
}