pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

contract LAF is Ownable
{
    uint256 public itemCount = 0;
    mapping (uint256 => LAFItem) public items;

    address private _owner;

    event ItemStored(bytes8 indexed isoCountryCode,
        bytes8 indexed stateProvince,
        bytes32 indexed city,
        bytes32 title,
        uint256 itemId,
        uint256 reward);
    
    event ItemFound(uint256 itemId, bytes8 indexed isoCountryCode, bytes8 indexed stateProvince);
    event ItemRecovered(uint256 itemId, bytes8 indexed isoCountryCode, bytes8 indexed stateProvince);
    event ItemCancelled(uint256 itemId);

    struct LAFItem
    {
        uint256 id;
        ItemStatus itemStatus;
        bytes8 isoCountryCode;
        bytes8 stateProvince;
        bytes32 city;
        bytes32 title;
        uint256 reward;
        bytes32 ipfsHash;
        address payable itemOwner;
        address payable itemDiscoverer;
    }

    enum ItemStatus
    {
        Lost,
        Found,
        Recovered,
        Cancelled
    }
    
    modifier onlyContractOrItemOwners(uint256 itemId)
    {
        LAFItem memory item = items[itemId];
        require(msg.sender == owner() || msg.sender == item.itemOwner);
        _;
    }

    modifier onlyItemOwner(uint256 itemId)
    {
        LAFItem memory item = items[itemId];
        require(msg.sender == item.itemOwner);
        _;
    }

    modifier onlyItemStatusLost(uint256 itemId)
    {
        LAFItem memory item = items[itemId];
        require(item.itemStatus == ItemStatus.Lost);
        _;
    }

    modifier onlyItemStatusFound(uint256 itemId)
    {
        LAFItem memory item = items[itemId];
        require(item.itemStatus == ItemStatus.Found);
        _;
    }

    modifier onlyItemStatusLostOrFound(uint256 itemId)
    {
        LAFItem memory item = items[itemId];
        require(item.itemStatus == ItemStatus.Lost || item.itemStatus == ItemStatus.Found);
        _;
    }

    // TODO
    // IPFS hash
    // improved tests
    // system fees ???
    // separate storage layer ???
    // separate rewards to dedicated wallet ???

    function newLostItem(bytes8 isoCountryCode, bytes8 stateProvince, bytes32 city, bytes32 title)
        public
        payable
    {        
        LAFItem memory newItem;
        newItem.id = itemCount;
        newItem.itemStatus = ItemStatus.Lost;
        newItem.isoCountryCode = isoCountryCode;
        newItem.stateProvince = stateProvince;
        newItem.city = city;
        newItem.title = title;
        newItem.reward = msg.value;
        newItem.itemOwner = msg.sender;
        
        items[itemCount] = newItem;

        emit ItemStored(isoCountryCode, stateProvince, city, title, itemCount, msg.value);

        itemCount++;
    }

    function setItemFound(uint256 itemId)
        public
        onlyItemStatusLost(itemId)
    {
        // retrieve item as storage ref
        LAFItem storage item = items[itemId];

        // flip item status to found
        item.itemStatus = ItemStatus.Found;

        // set the address of person that found the item
        item.itemDiscoverer = msg.sender;

        emit ItemFound(itemId, item.isoCountryCode, item.stateProvince);
    }

    function setItemRecovered(uint256 itemId)
        public
        onlyItemStatusFound(itemId)
        onlyItemOwner(itemId)
    {
        // retrieve item as storage ref
        LAFItem storage item = items[itemId];

        // flip item status to recovered
        item.itemStatus = ItemStatus.Recovered;

        // reward the itemDiscoverer
        item.itemDiscoverer.transfer(item.reward);

        emit ItemRecovered(itemId, item.isoCountryCode, item.stateProvince);
    }

    function cancelItem(uint256 itemId)
        public
        onlyItemStatusLostOrFound(itemId)
        onlyContractOrItemOwners(itemId)
    {
        // retrieve item as storage ref
        LAFItem storage item = items[itemId];

        // flip item status to cancelled
        item.itemStatus = ItemStatus.Cancelled;

        // refund reward ETH
        item.itemOwner.transfer(item.reward);

        emit ItemCancelled(itemId);
    }
}