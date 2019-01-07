pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2; //possible use: returning structs (indexed event params problem)

import "./LAFRegistryBase.sol";
// import "./LAFAsset.sol";
import "./LAFAssetStorage.sol";

/**
 * SETUP:
 * deploy LAFAssetStorage
 * deploy LAFAssetRegistry
 * call setAssetStorage on LAFAssetRegistry with address or storage contract
 * call setRegistryAddress on LAFAssetStorage with address of registry contract
 * call enableRegistry on LAFAssetRegistry
 */

contract LAFAssetRegistry is LAFRegistryBase
{
    event AssetStored(
        uint256 assetId,
        bytes indexed isoCountryCode,
        bytes indexed stateProvince,
        string title,
        InitialAssetType indexed initialAssetType);
    event AssetCancelled(uint256 assetId);
    event PotentialMatch(uint256 itemId, bytes indexed isoCountryCode, bytes indexed stateProvince);
    event MatchConfirmed(uint256 itemId);
    event MatchInvalid(uint256);
    event AssetRecovered(uint256, uint256);
    event RecoveryFailed(uint256);
    
    struct LAFAsset
    {
        string title;
        bytes isoCountryCode;
        bytes stateProvince;
    }
    
    enum InitialAssetType
    {
        Lost,
        Found
    }
    
    enum AssetStatus
    {
        Posted,
        PotentialMatch,
        MatchConfirmed,
        Recovered,
        Cancelled
    }
    
    modifier onlyContractOwnerOrAssetCreator(uint256 assetId)
    {
        require(msg.sender == owner() || msg.sender == LAFAssetStorage(storageAddress).getAssetCreator(assetId));
        _;
    }
    
    modifier onlyAssetCreator(uint256 assetId)
    {
        require(msg.sender == LAFAssetStorage(storageAddress).getAssetCreator(assetId));
        _;
    }
    
    modifier onlyAssetStatusPosted(uint256 assetId)
    {
        require(AssetStatus(LAFAssetStorage(storageAddress).getAssetStatus(assetId)) == AssetStatus.Posted);
        _;
    }
    
    modifier onlyAssetStatusPotentialMatch(uint256 assetId)
    {
        require(AssetStatus(LAFAssetStorage(storageAddress).getAssetStatus(assetId)) == AssetStatus.PotentialMatch);
        _;
    }
    
    modifier onlyAssetStatusMatchConfirmed(uint256 assetId)
    {
        require(AssetStatus(LAFAssetStorage(storageAddress).getAssetStatus(assetId)) == AssetStatus.MatchConfirmed);
        _;
    }
    
    modifier onlyAssetStatusNotCancelledOrRecovered(uint256 assetId)
    {
        AssetStatus status = AssetStatus(LAFAssetStorage(storageAddress).getAssetStatus(assetId));
        require(status != AssetStatus.Cancelled);
        require(status != AssetStatus.Recovered);
        _;
    }
    
    // =======================================================
    // ADMIN
    // =======================================================
    function transferFunds(address payable newRegistryAddress)
        public
        onlyOwner
    {
        // TODO make this better
        // send contract ETH to new registry
        newRegistryAddress.transfer(address(this).balance);
    }
    
    // =======================================================
    // INTERNAL
    // =======================================================
    function newAsset(
        InitialAssetType initialAssetType,
        string memory assetTitle,
        bytes memory isoCountryCode,
        bytes memory stateProvince,
        bytes memory city,
        string memory description,
        uint256 reward,
        address payable creator
    )
        private
        registryEnabled
        storageSet
    {
        uint256 assetId = LAFAssetStorage(storageAddress).getItemCount();
        
        LAFAssetStorage(storageAddress).storeAssetTitle(assetId, assetTitle);
        LAFAssetStorage(storageAddress).storeAssetDescription(assetId, description);
        
        LAFAssetStorage(storageAddress).storeAssetIsoCountryCode(assetId, isoCountryCode);
        LAFAssetStorage(storageAddress).storeAssetStateProvince(assetId, stateProvince);
        LAFAssetStorage(storageAddress).storeAssetCity(assetId, city);
        
        LAFAssetStorage(storageAddress).storeAssetReward(assetId, reward);
        LAFAssetStorage(storageAddress).storeAssetCreator(assetId, creator);
        
        LAFAssetStorage(storageAddress).storeAssetInitialType(assetId, uint(initialAssetType));
        LAFAssetStorage(storageAddress).storeAssetStatus(assetId, uint(AssetStatus.Posted));
        
        LAFAssetStorage(storageAddress).incrementItemCount();
        
        emit AssetStored(assetId, isoCountryCode, stateProvince, assetTitle, initialAssetType);
    }
    
    // =======================================================
    // PUBLIC API
    // =======================================================
    function getAsset(uint256 assetId)
        public
        view
        returns(
            string memory title,
            bytes memory isoCountryCode,
            bytes memory stateProvince,
            bytes memory city,
            string memory description,
            uint256 reward,
            InitialAssetType initialAssetType,
            AssetStatus assetStatus
        )
    {
        title = LAFAssetStorage(storageAddress).getAssetTitle(assetId);
        isoCountryCode = LAFAssetStorage(storageAddress).getAssetIsoCountryCode(assetId);
        stateProvince = LAFAssetStorage(storageAddress).getAssetStateProvince(assetId);
        city = LAFAssetStorage(storageAddress).getAssetCity(assetId);
        description = LAFAssetStorage(storageAddress).getAssetDescription(assetId);
        reward = LAFAssetStorage(storageAddress).getAssetReward(assetId);
        initialAssetType = InitialAssetType(LAFAssetStorage(storageAddress).getAssetInitialType(assetId));
        assetStatus = AssetStatus(LAFAssetStorage(storageAddress).getAssetStatus(assetId));
    }
    
    function newLostAsset(
        string memory assetTitle,
        string memory description,
        bytes memory isoCountryCode,
        bytes memory stateProvince,
        bytes memory city   
    )
        public
        payable
        registryEnabled
        storageSet
    {
        newAsset(
            InitialAssetType.Lost,
            assetTitle,
            isoCountryCode,
            stateProvince,
            city,
            description,
            msg.value,
            msg.sender
        );
    }
    
    function newFoundAsset(
        string memory assetTitle,
        string memory description,
        bytes memory isoCountryCode,
        bytes memory stateProvince,
        bytes memory city
    )
        public
        payable
        registryEnabled
        storageSet
    {
        newAsset(
            InitialAssetType.Found,
            assetTitle,
            isoCountryCode,
            stateProvince,
            city,
            description,
            msg.value,
            msg.sender
        );
    }
    
    function potentialMatch(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyAssetStatusPosted(assetId)
    {
        LAFAssetStorage(storageAddress).storeAssetStatus(assetId, uint(AssetStatus.PotentialMatch));
        LAFAssetStorage(storageAddress).storeAssetMatcher(assetId, msg.sender);
        
        bytes memory isoCountryCode = LAFAssetStorage(storageAddress).getAssetIsoCountryCode(assetId);
        bytes memory stateProvince = LAFAssetStorage(storageAddress).getAssetStateProvince(assetId);
        
        emit PotentialMatch(assetId, isoCountryCode, stateProvince);
    }
    
    // exchangeDetails = date, time, [public] place
    function matchConfirmed(uint256 assetId, string memory exchangeDetails)
        public
        registryEnabled
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusPotentialMatch(assetId)
    {
        LAFAssetStorage(storageAddress).storeAssetStatus(assetId, uint(AssetStatus.MatchConfirmed));
        LAFAssetStorage(storageAddress).storeAssetExchangeDetails(assetId, exchangeDetails);
        
        emit MatchConfirmed(assetId);
    }
    
    function matchInvalid(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusPotentialMatch(assetId)
    {
        LAFAssetStorage(storageAddress).storeAssetStatus(assetId, uint(AssetStatus.Posted));
        LAFAssetStorage(storageAddress).storeAssetMatcher(assetId, address(0));
        
        emit MatchInvalid(assetId);
    }
    
    function assetRecovered(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusMatchConfirmed(assetId)
    {
        LAFAssetStorage(storageAddress).storeAssetStatus(assetId, uint(AssetStatus.Recovered));
        
        address payable matcher = LAFAssetStorage(storageAddress).getAssetMatcher(assetId);
        uint256 reward = LAFAssetStorage(storageAddress).getAssetReward(assetId);
        matcher.transfer(reward);
        
        emit AssetRecovered(assetId, reward);
    }
    
    function recoveryFailed(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusMatchConfirmed(assetId)
    {
        LAFAssetStorage(storageAddress).storeAssetStatus(assetId, uint(AssetStatus.Posted));
        LAFAssetStorage(storageAddress).storeAssetMatcher(assetId, address(0));
        LAFAssetStorage(storageAddress).storeAssetExchangeDetails(assetId, "");
        
        emit RecoveryFailed(assetId);
    }
    
    function cancelAsset(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyContractOwnerOrAssetCreator(assetId)
        onlyAssetStatusNotCancelledOrRecovered(assetId)
    {
        LAFAssetStorage(storageAddress).storeAssetStatus(assetId, uint(AssetStatus.Cancelled));
        
        // send reward back to creator
        // TODO add checks
        address payable creator = LAFAssetStorage(storageAddress).getAssetCreator(assetId);
        creator.transfer(LAFAssetStorage(storageAddress).getAssetReward(assetId));
        
        emit AssetCancelled(assetId);
    }
}