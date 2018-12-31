pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import { LAF } from "./LAF.sol";
import { LAFLib } from "../libraries/LAFLib.sol";

contract LAFItemStorage is Ownable
{
    event ItemStored(bytes8 indexed isoCountryCode,
        bytes16 indexed stateProvince,
        bytes32 indexed city,
        bytes32 title,
        uint256 itemId);

    LAF private _laf;

    uint256 public itemCount = 0;
    mapping (uint256 => LAFLib.LAFItem) public items;

    LAF public _lafContract;

    /// @dev change the 
    function setLAFContract(address newLafContractAddress)
        onlyOwner
        public
    {
        _lafContract = LAF(newLafContractAddress);
    }
    
    // function storeLAFItem(LAFLib.LAFItem memory newItem)
    //     public
    // {
    //     // require(msg.sender == _laf);

    //     items[itemCount] = newItem;

    //     // emit ItemStored(newItem.ItemData.isoCountryCode, newItem.ItemData.stateProvince, newItem.ItemData.city, newItem.ItemData.title, itemCount);

    //     itemCount++;
    // }
}