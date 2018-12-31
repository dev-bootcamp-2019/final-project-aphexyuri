pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

// import { LAFItemStorage } from "./LAFItemStorage.sol";
// import { LAFLib } from "../libraries/LAFLib.sol";

contract LAF is Ownable
{
    uint256 public itemCount = 0;
    mapping (uint256 => LAFItem) public items;

    event ItemStored(bytes8 indexed isoCountryCode,
        bytes16 indexed stateProvince,
        bytes32 indexed city,
        bytes32 title,
        uint256 itemId,
        uint256 rewardAmount);

    struct LAFItem {
        uint256 id;
        bytes8 isoCountryCode;
        bytes16 stateProvince;
        bytes32 city;
        bytes32 title;
        uint256 rewardAmount;
        address poster;
        bytes32 ipfsHash;
    }

    // LAFItemStorage public _lafItemStorageContract;

    // function setStorageContract(address newStorageContractAddress)
    //     onlyOwner
    //     public
    // {
    //     _lafItemStorageContract = LAFItemStorage(newStorageContractAddress);
    // }

    function postItem(bytes8 isoCountryCode, bytes16 stateProvince, bytes32 city, bytes32 title, uint256 rewardAmount)
        public
    {        
        LAFItem memory newItem;
        newItem.id = itemCount;
        newItem.isoCountryCode = isoCountryCode;
        newItem.stateProvince = stateProvince;
        newItem.city = city;
        newItem.title = title;
        newItem.rewardAmount = rewardAmount;
        newItem.poster = msg.sender;

        // _lafItemStorageContract.storeLAFItem(newItem);
        
        items[itemCount] = newItem;

        emit ItemStored(isoCountryCode, stateProvince, city, title, itemCount, rewardAmount);

        itemCount++;
    }
}