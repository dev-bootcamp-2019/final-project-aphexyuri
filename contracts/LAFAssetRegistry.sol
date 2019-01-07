pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2; //possible use: returning structs (indexed event params problem)

import "./LAFRegistryBase.sol";
import "./LAFAssetStorage.sol";

/**
 * SETUP:
 * deploy LAFAssetStorage
 * deploy LAFAssetRegistry
 * call setAssetStorage on LAFAssetRegistry with address or storage contract
 * call setRegistryAddress on LAFAssetStorage with address of registry contract
 * call enableRegistry on LAFAssetRegistry
 * 
 * TODO
 * set initial assetCount
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
    event PotentialMatch(uint256 assetId, bytes indexed isoCountryCode, bytes indexed stateProvince);
    event MatchConfirmed(uint256 assetId);
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
        require(msg.sender == owner() || msg.sender == LAFStorageLib.getAssetCreator(storageLibData.assetStorageAddress, assetId));
        _;
    }
    
    modifier onlyAssetCreator(uint256 assetId)
    {
        require(msg.sender == LAFStorageLib.getAssetCreator(storageLibData.assetStorageAddress, assetId));
        _;
    }
    
    modifier onlyAssetStatusPosted(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(storageLibData.assetStorageAddress, assetId)) == AssetStatus.Posted);
        _;
    }
    
    modifier onlyAssetStatusPotentialMatch(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(storageLibData.assetStorageAddress, assetId)) == AssetStatus.PotentialMatch);
        _;
    }
    
    modifier onlyAssetStatusMatchConfirmed(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(storageLibData.assetStorageAddress, assetId)) == AssetStatus.MatchConfirmed);
        _;
    }
    
    modifier onlyAssetStatusNotCancelledOrRecovered(uint256 assetId)
    {
        AssetStatus status = AssetStatus(LAFStorageLib.getAssetStatus(storageLibData.assetStorageAddress, assetId));
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
        uint256 assetId = LAFStorageLib.getAssetCount(storageLibData.assetStorageAddress);
        
        LAFStorageLib.storeAssetTitle(storageLibData.assetStorageAddress, assetId, assetTitle);
        LAFStorageLib.storeAssetDescription(storageLibData.assetStorageAddress, assetId, description);
        
        LAFStorageLib.storeAssetIsoCountryCode(storageLibData.assetStorageAddress, assetId, isoCountryCode);
        LAFStorageLib.storeAssetStateProvince(storageLibData.assetStorageAddress, assetId, stateProvince);
        LAFStorageLib.storeAssetCity(storageLibData.assetStorageAddress, assetId, city);
        
        LAFStorageLib.storeAssetReward(storageLibData.assetStorageAddress, assetId, reward);
        LAFStorageLib.storeAssetCreator(storageLibData.assetStorageAddress, assetId, creator);
        
        LAFStorageLib.storeAssetInitialType(storageLibData.assetStorageAddress, assetId, uint(initialAssetType));
        LAFStorageLib.storeAssetStatus(storageLibData.assetStorageAddress, assetId, uint(AssetStatus.Posted));
        
        LAFStorageLib.incrementAssetCount(storageLibData.assetStorageAddress);
        
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
        title = LAFStorageLib.getAssetTitle(storageLibData.assetStorageAddress, assetId);
        isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(storageLibData.assetStorageAddress, assetId);
        stateProvince = LAFStorageLib.getAssetStateProvince(storageLibData.assetStorageAddress, assetId);
        city = LAFStorageLib.getAssetCity(storageLibData.assetStorageAddress, assetId);
        description = LAFStorageLib.getAssetDescription(storageLibData.assetStorageAddress, assetId);
        reward = LAFStorageLib.getAssetReward(storageLibData.assetStorageAddress, assetId);
        initialAssetType = InitialAssetType(LAFStorageLib.getAssetInitialType(storageLibData.assetStorageAddress, assetId));
        assetStatus = AssetStatus(LAFStorageLib.getAssetStatus(storageLibData.assetStorageAddress, assetId));
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
        newAsset(InitialAssetType.Lost, assetTitle, isoCountryCode, stateProvince, city, description, msg.value, msg.sender);
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
        newAsset(InitialAssetType.Found, assetTitle, isoCountryCode, stateProvince, city, description, msg.value, msg.sender);
    }
    
    function potentialMatch(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyAssetStatusPosted(assetId)
    {
        LAFStorageLib.storeAssetStatus(storageLibData.assetStorageAddress, assetId, uint(AssetStatus.PotentialMatch));
        LAFStorageLib.storeAssetMatcher(storageLibData.assetStorageAddress, assetId, msg.sender);
        
        bytes memory isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(storageLibData.assetStorageAddress, assetId);
        bytes memory stateProvince = LAFStorageLib.getAssetStateProvince(storageLibData.assetStorageAddress, assetId);
        
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
        LAFStorageLib.storeAssetStatus(storageLibData.assetStorageAddress, assetId, uint(AssetStatus.MatchConfirmed));
        LAFStorageLib.storeAssetExchangeDetails(storageLibData.assetStorageAddress, assetId, exchangeDetails);
        
        emit MatchConfirmed(assetId);
    }
    
    function matchInvalid(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusPotentialMatch(assetId)
    {
        LAFStorageLib.storeAssetStatus(storageLibData.assetStorageAddress, assetId, uint(AssetStatus.Posted));
        LAFStorageLib.storeAssetMatcher(storageLibData.assetStorageAddress, assetId, address(0));
        
        emit MatchInvalid(assetId);
    }
    
    function assetRecovered(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusMatchConfirmed(assetId)
    {
        LAFStorageLib.storeAssetStatus(storageLibData.assetStorageAddress, assetId, uint(AssetStatus.Recovered));
        
        address payable matcher = LAFStorageLib.getAssetMatcher(storageLibData.assetStorageAddress, assetId);
        uint256 reward = LAFStorageLib.getAssetReward(storageLibData.assetStorageAddress, assetId);
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
        LAFStorageLib.storeAssetStatus(storageLibData.assetStorageAddress, assetId, uint(AssetStatus.Posted));
        LAFStorageLib.storeAssetMatcher(storageLibData.assetStorageAddress, assetId, address(0));
        LAFStorageLib.storeAssetExchangeDetails(storageLibData.assetStorageAddress, assetId, "");
        
        emit RecoveryFailed(assetId);
    }
    
    function cancelAsset(uint256 assetId)
        public
        registryEnabled
        storageSet
        onlyContractOwnerOrAssetCreator(assetId)
        onlyAssetStatusNotCancelledOrRecovered(assetId)
    {
        LAFStorageLib.storeAssetStatus(storageLibData.assetStorageAddress, assetId, uint(AssetStatus.Cancelled));
        
        // send reward back to creator
        // TODO add checks
        address payable creator = LAFStorageLib.getAssetCreator(storageLibData.assetStorageAddress, assetId);
        creator.transfer(LAFStorageLib.getAssetReward(storageLibData.assetStorageAddress, assetId));
        
        emit AssetCancelled(assetId);
    }
}