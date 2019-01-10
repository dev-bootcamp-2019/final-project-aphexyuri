pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

contract LAFAssetStorage is Ownable
{
    address public allowedSender;

    // basic types    
    mapping(bytes32 => uint256) public uintStorage;
    mapping(bytes32 => string) public stringStorage;
    mapping(bytes32 => address payable) public addressStorage;
    mapping(bytes32 => bytes) public bytesStorage;
    mapping(bytes32 => bool) public boolStorage;
    mapping(bytes32 => int256) public intStorage;

    // complex types
    mapping(bytes32 => mapping(address => uint256)) public addressUint256MappingStore;
    mapping(bytes32 => mapping(address => uint256[])) public addressUint256ArrayStore;
    
    modifier onlyAllowedSenderOrOwner()
    {
        require(allowedSender != address(0));
        require(msg.sender == allowedSender || msg.sender == owner());
        _;
    }

    // =======================================================
    // ADMIN
    // =======================================================
    function setAllowedSender(address newAllowedSender)
        public
        onlyOwner
    {
        allowedSender = newAllowedSender;
    }

    function addressToBytes32(address addressToConvert)
        public
        pure
        returns(bytes32)
    {
        return bytes32(uint256(addressToConvert) << 96);
    }
    
    // =======================================================
    // STORAGE MODIFIERS
    // =======================================================
    function storeUint256(bytes32 key, uint256 value)
        public
        onlyAllowedSenderOrOwner
    {
        uintStorage[key] = value;
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

    function storeBytes(bytes32 key, bytes memory value)
        public
        onlyAllowedSenderOrOwner
    {
        bytesStorage[key] = value;
    }

    function storeBool(bytes32 key, bool value)
        public
        onlyAllowedSenderOrOwner
    {
        boolStorage[key] = value;
    }

    function storeInt256(bytes32 key, int value)
        public
        onlyAllowedSenderOrOwner
    {
        intStorage[key] = value;
    }

    function storeAddressUint256Mapping(bytes32 key, address addressValue, uint256 uint256Value)
        public
        onlyAllowedSenderOrOwner
    {
        addressUint256MappingStore[key][addressValue] = uint256Value;
    }

    function storeAddressUint256ArrayMapping(bytes32 key, address addressValue, uint256[] memory uint256ArrayValue)
        public
        onlyAllowedSenderOrOwner
    {
        addressUint256ArrayStore[key][addressValue] = uint256ArrayValue;
    }
}