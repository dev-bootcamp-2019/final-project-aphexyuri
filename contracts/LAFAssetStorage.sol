pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

contract LAFAssetStorage is Ownable
{
    address public allowedSender;
    
    mapping(bytes32 => uint256) public uintStorage;
    mapping(bytes32 => string) public stringStorage;
    mapping(bytes32 => address payable) public addressStorage;
    mapping(bytes32 => bytes) public bytesStorage;
    mapping(bytes32 => bool) public boolStorage;
    mapping(bytes32 => int256) public intStorage;
    
    modifier onlyAllowedSender()
    {
        require(allowedSender != address(0));
        require(msg.sender == allowedSender);
        _;
    }
    
    function setAllowedSender(address newAllowedSender)
        public
        onlyOwner
    {
        allowedSender = newAllowedSender;
    }
    
    // =======================================================
    // STORAGE MODIFIERS
    // =======================================================
    function storeUint256(bytes32 key, uint256 value)
        public
        onlyAllowedSender
    {
        uintStorage[key] = value;
    }

    function storeString(bytes32 key, string memory value)
        public
        onlyAllowedSender
    {
        stringStorage[key] = value;
    }

    function storeAddress(bytes32 key, address payable value)
        public
        onlyAllowedSender
    {
        addressStorage[key] = value;
    }

    function storeBytes(bytes32 key, bytes memory value)
        public
        onlyAllowedSender
    {
        bytesStorage[key] = value;
    }

    function storeBool(bytes32 key, bool value)
        public
        onlyAllowedSender
    {
        boolStorage[key] = value;
    }

    function storeInt256(bytes32 key, int value)
        public
        onlyAllowedSender
    {
        intStorage[key] = value;
    }
}