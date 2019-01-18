pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

contract LAFAssetStorage is Ownable
{
    mapping (address => bool) allowedSenders;

    // basic types
    mapping(bytes32 => int8) public int8Storage;
    mapping(bytes32 => int16) public int16Storage;
    mapping(bytes32 => int32) public int32Storage;
    mapping(bytes32 => int64) public int64Storage;
    mapping(bytes32 => int128) public int128Storage;
    mapping(bytes32 => int256) public int256Storage;

    mapping(bytes32 => uint8) public uint8Storage;
    mapping(bytes32 => uint16) public uint16Storage;
    mapping(bytes32 => uint32) public uint32Storage;
    mapping(bytes32 => uint64) public uint64Storage;
    mapping(bytes32 => uint128) public uint128Storage;
    mapping(bytes32 => uint256) public uint256Storage;
    
    mapping(bytes32 => bytes) public bytesStorage;
    mapping(bytes32 => bytes8) public bytes8Storage;
    mapping(bytes32 => bytes16) public bytes16Storage;
    mapping(bytes32 => bytes32) public bytes32Storage;

    mapping(bytes32 => bool) public boolStorage;
    mapping(bytes32 => string) public stringStorage;
    mapping(bytes32 => address payable) public addressStorage;

    // complex types
    mapping(bytes32 => mapping(address => uint256)) public addressUint256MappingStore;
    mapping(bytes32 => mapping(address => uint256[])) private addressUint256ArrayMappingStore;
    
    modifier onlyAllowedSenderOrOwner()
    {
        require(allowedSenders[msg.sender] || msg.sender == owner());
        _;
    }

    // =======================================================
    // ADMIN
    // =======================================================
    function addAllowedSender(address newSender)
        public
        onlyOwner
    {
        require(newSender != address(0));
        allowedSenders[newSender] = true;
    }

    function removeAllowedSender(address oldSender)
        public
        onlyOwner
    {
        require(oldSender != address(0));
        allowedSenders[oldSender] = false;
    }

    // =======================================================
    // HELPERS
    // =======================================================
    /// @dev used for testing
    function senderIsAllowed(address sender)
        public
        view
        returns(bool)
    {
        return allowedSenders[sender];
    }

    function addressToBytes32(address addressToConvert)
        public
        pure
        returns(bytes32)
    {
        return bytes32(uint256(addressToConvert) << 96);
    }

    // =======================================================
    // STORAGE ACCESSORS
    // =======================================================
    // function getUint256ArrayForAddressFromMapping(bytes32 mappingKey, address addressValue)
    //     public
    //     view
    //     returns(uint256[] memory)
    // {
    //     return addressUint256ArrayMappingStore[mappingKey][addressValue];
    // }
    
    // =======================================================
    // STORAGE MODIFIERS
    // =======================================================
    function storeInt8(bytes32 key, int8 value)
        public
        onlyAllowedSenderOrOwner
    {
        int8Storage[key] = value;
    }

    function storeInt16(bytes32 key, int16 value)
        public
        onlyAllowedSenderOrOwner
    {
        int16Storage[key] = value;
    }

    function storeInt32(bytes32 key, int32 value)
        public
        onlyAllowedSenderOrOwner
    {
        int32Storage[key] = value;
    }

    function storeInt64(bytes32 key, int64 value)
        public
        onlyAllowedSenderOrOwner
    {
        int64Storage[key] = value;
    }

    function storeInt128(bytes32 key, int128 value)
        public
        onlyAllowedSenderOrOwner
    {
        int128Storage[key] = value;
    }
    
    function storeInt256(bytes32 key, int256 value)
        public
        onlyAllowedSenderOrOwner
    {
        int256Storage[key] = value;
    }

    function storeUint8(bytes32 key, uint8 value)
        public
        onlyAllowedSenderOrOwner
    {
        uint8Storage[key] = value;
    }

    function storeUint16(bytes32 key, uint16 value)
        public
        onlyAllowedSenderOrOwner
    {
        uint16Storage[key] = value;
    }

    function storeUint32(bytes32 key, uint32 value)
        public
        onlyAllowedSenderOrOwner
    {
        uint32Storage[key] = value;
    }

    function storeUint64(bytes32 key, uint64 value)
        public
        onlyAllowedSenderOrOwner
    {
        uint64Storage[key] = value;
    }

    function storeUint128(bytes32 key, uint128 value)
        public
        onlyAllowedSenderOrOwner
    {
        uint128Storage[key] = value;
    }

    function storeUint256(bytes32 key, uint256 value)
        public
        onlyAllowedSenderOrOwner
    {
        uint256Storage[key] = value;
    }

    function storeBytes(bytes32 key, bytes memory value)
        public
        onlyAllowedSenderOrOwner
    {
        bytesStorage[key] = value;
    }

    function storeBytes8(bytes32 key, bytes8 value)
        public
        onlyAllowedSenderOrOwner
    {
        bytes8Storage[key] = value;
    }

    function storeBytes16(bytes32 key, bytes16 value)
        public
        onlyAllowedSenderOrOwner
    {
        bytes16Storage[key] = value;
    }

    function storeBytes32(bytes32 key, bytes32 value)
        public
        onlyAllowedSenderOrOwner
    {
        bytes32Storage[key] = value;
    }

    function storeBool(bytes32 key, bool value)
        public
        onlyAllowedSenderOrOwner
    {
        boolStorage[key] = value;
    }

    function storeString(bytes32 key, string memory value)
        public
        onlyAllowedSenderOrOwner
    {
        stringStorage[key] = value;
    }

    function storeAddress(bytes32 key, address payable value)
        public
        onlyAllowedSenderOrOwner
    {
        addressStorage[key] = value;
    }

    function storeAddressUint256Mapping(bytes32 key, address addressValue, uint256 uint256Value)
        public
        onlyAllowedSenderOrOwner
    {
        addressUint256MappingStore[key][addressValue] = uint256Value;
    }

    // function storeAddressUint256ArrayMapping(bytes32 key, address addressValue, uint256[] memory uint256ArrayValue)
    //     public
    //     onlyAllowedSenderOrOwner
    // {
    //     addressUint256ArrayMappingStore[key][addressValue] = uint256ArrayValue;
    // }
}