pragma solidity ^0.5.0;

library LAFLib
{
    struct LAFItem
    {
        uint256 id;
        bytes8 isoCountryCode;
        bytes16 stateProvince;
        bytes32 city;
        bytes32 title;
    }
}