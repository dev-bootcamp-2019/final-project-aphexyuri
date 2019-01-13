pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2; //possible use: returning structs (indexed event params problem)

import "./LAFRegistryBase.sol";
import "./LAFAssetStorage.sol";

/**
 * SETUP:
 * deploy LAFAssetStorage - once only
 * deploy LAFAssetRegistry
 * call setAssetStorageAddress on LAFAssetRegistry with address or storage contract
 * call enableRegistry on LAFAssetRegistry
 * call setAllowedSender on LAFAssetStorage with address of registry contract
 *
 * not suire if intial assetCount needs to be set as an attempt to retreive unset from mapping might result in a zero response
 */

contract LAFAssetRegistry is LAFRegistryBase
{
    // =======================================================
    // EVENTS
    // =======================================================
    event AssetStored(
        uint256 assetId,
        bytes indexed isoCountryCode,
        bytes indexed stateProvince,
        string title,
        InitialAssetType indexed initialAssetType);
    event AssetCancelled(uint256 assetId);
    event FoundLostAsset(uint256 assetId, bytes indexed isoCountryCode, bytes indexed stateProvince);
    event MatchConfirmed(uint256 assetId);
    event MatchInvalid(uint256 assetID);
    event AssetRecovered(uint256 assetId, uint256 reward);
    event RecoveryFailed(uint256 assetId);
    
    // =======================================================
    // STRUCTS
    // =======================================================
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

    // =======================================================
    // MODIFIERS
    // =======================================================
    modifier onlyContractOwnerOrAssetCreator(uint256 assetId)
    {
        require(msg.sender == owner() || msg.sender == LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId));
        _;
    }
    
    modifier onlyAssetCreator(uint256 assetId)
    {
        require(msg.sender == LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId));
        _;
    }

    modifier onlyAssetMatcher(uint256 assetId)
    {
        require(msg.sender == LAFStorageLib.getAssetMatcher(getAssetStorageAddress(), assetId));
        _;
    }
    
    modifier onlyAssetStatusPosted(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId)) == AssetStatus.Posted);
        _;
    }
    
    modifier onlyAssetStatusPotentialMatch(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId)) == AssetStatus.PotentialMatch);
        _;
    }
    
    modifier onlyAssetStatusMatchConfirmed(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId)) == AssetStatus.MatchConfirmed);
        _;
    }
    
    modifier onlyAssetStatusNotCancelledOrRecovered(uint256 assetId)
    {
        AssetStatus status = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
        require(status != AssetStatus.Cancelled);
        require(status != AssetStatus.Recovered);
        _;
    }

    modifier onlyAssetRecovered(uint256 assetId)
    {
        AssetStatus status = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
        require(status == AssetStatus.Recovered);
        _;
    }

    modifier onlyAssetIntialTypeLost(uint256 assetId)
    {
        InitialAssetType initialAssetType = InitialAssetType(LAFStorageLib.getAssetInitialType(getAssetStorageAddress(), assetId));
        require(initialAssetType == InitialAssetType.Lost);
        _;
    }
    
    // =======================================================
    // INTERNAL / PRIVATE API
    // =======================================================
    /// @notice Internal method for creating a new asset
    /// @param initialAssetType Initial asset type enum
    /// @param assetTitle Title of asset
    /// @param isoCountryCode Title of asset
    /// @param stateProvince State/Province of asset
    /// @param city City of asset
    // @param description Description of asset
    function newAsset(
        InitialAssetType initialAssetType,
        string memory assetTitle,
        bytes memory isoCountryCode,
        bytes memory stateProvince,
        bytes memory city
        // string memory description
    )
        private
        whenNotPaused
        storageSet
    {
        // get assetid & increment
        uint256 assetId = LAFStorageLib.getAssetCount(getAssetStorageAddress());
        LAFStorageLib.incrementAssetCount(getAssetStorageAddress());
        
        LAFStorageLib.storeAssetTitle(getAssetStorageAddress(), assetId, assetTitle);
        // LAFStorageLib.storeAssetDescription(getAssetStorageAddress(), assetId, description);
        
        LAFStorageLib.storeAssetIsoCountryCode(getAssetStorageAddress(), assetId, isoCountryCode);
        LAFStorageLib.storeAssetStateProvince(getAssetStorageAddress(), assetId, stateProvince);
        LAFStorageLib.storeAssetCity(getAssetStorageAddress(), assetId, city);
        
        LAFStorageLib.storeAssetReward(getAssetStorageAddress(), assetId, msg.value);
        LAFStorageLib.storeAssetCreator(getAssetStorageAddress(), assetId, msg.sender);
        
        LAFStorageLib.storeAssetInitialType(getAssetStorageAddress(), assetId, uint(initialAssetType));
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint(AssetStatus.Posted));
        
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
            // string memory description, // TODO get metadata? stack depth error!!!
            uint256 reward,
            address creator,
            address matcher,
            InitialAssetType initialAssetType,
            AssetStatus assetStatus
        )
    {
        title = LAFStorageLib.getAssetTitle(getAssetStorageAddress(), assetId);
        isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(getAssetStorageAddress(), assetId);
        stateProvince = LAFStorageLib.getAssetStateProvince(getAssetStorageAddress(), assetId);
        city = LAFStorageLib.getAssetCity(getAssetStorageAddress(), assetId);
        // description = LAFStorageLib.getAssetDescription(getAssetStorageAddress(), assetId); // TODO get metadata? stack depth error!!!
        reward = LAFStorageLib.getAssetReward(getAssetStorageAddress(), assetId);
        creator = LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId);
        matcher = LAFStorageLib.getAssetMatcher(getAssetStorageAddress(), assetId);
        initialAssetType = InitialAssetType(LAFStorageLib.getAssetInitialType(getAssetStorageAddress(), assetId));
        assetStatus = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
    }

    function getClaimableRewards()
        public
        view
        returns(uint)
    {
        return LAFStorageLib.getClaimableReward(getAssetStorageAddress(), msg.sender);
    }
    
    function newLostAsset(
        string memory assetTitle,
        // string memory description,
        bytes memory isoCountryCode,
        bytes memory stateProvince,
        bytes memory city   
    )
        public
        payable
        whenNotPaused
        storageSet
    {
        // newAsset(InitialAssetType.Lost, assetTitle, isoCountryCode, stateProvince, city, description);
        newAsset(InitialAssetType.Lost, assetTitle, isoCountryCode, stateProvince, city);
    }
    
    function newFoundAsset(
        string memory assetTitle,
        // string memory description,
        bytes memory isoCountryCode,
        bytes memory stateProvince,
        bytes memory city
    )
        public
        payable
        whenNotPaused
        storageSet
    {
        // newAsset(InitialAssetType.Found, assetTitle, isoCountryCode, stateProvince, city, description);
        newAsset(InitialAssetType.Found, assetTitle, isoCountryCode, stateProvince, city);
    }

    function foundLostAsset(uint256 assetId)
        public
        whenNotPaused
        storageSet
        onlyAssetStatusPosted(assetId)
        onlyAssetIntialTypeLost(assetId)
    {
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint(AssetStatus.PotentialMatch));
        LAFStorageLib.storeAssetMatcher(getAssetStorageAddress(), assetId, msg.sender);
        
        bytes memory isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(getAssetStorageAddress(), assetId);
        bytes memory stateProvince = LAFStorageLib.getAssetStateProvince(getAssetStorageAddress(), assetId);
        
        emit FoundLostAsset(assetId, isoCountryCode, stateProvince);
    }

    // function asetOwnerFound(uint256 assetId)
    //     public
    //     whenNotPaused
    //     storageSet
    // {
    //     // TODO
    // }
    
    // exchangeDetails = date, time, [public] place
    function matchConfirmed(uint256 assetId, string memory exchangeDetails)
        public
        whenNotPaused
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusPotentialMatch(assetId)
    {
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint(AssetStatus.MatchConfirmed));

        if(bytes(exchangeDetails).length > 0)
        {
            LAFStorageLib.storeAssetExchangeDetails(getAssetStorageAddress(), assetId, exchangeDetails);
        }

        emit MatchConfirmed(assetId);
    }
    
    function matchInvalid(uint256 assetId)
        public
        whenNotPaused
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusPotentialMatch(assetId)
    {
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint(AssetStatus.Posted));
        LAFStorageLib.storeAssetMatcher(getAssetStorageAddress(), assetId, address(0));
        
        emit MatchInvalid(assetId);
    }
    
    function assetRecovered(uint256 assetId)
        public
        whenNotPaused
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusMatchConfirmed(assetId)
    {
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint(AssetStatus.Recovered));
        
        address payable matcher = LAFStorageLib.getAssetMatcher(getAssetStorageAddress(), assetId);
        uint256 assetRewardAmount = LAFStorageLib.getAssetReward(getAssetStorageAddress(), assetId);
        uint256 matcherRewards = LAFStorageLib.getClaimableReward(getAssetStorageAddress(), matcher);
        matcherRewards = matcherRewards.add(assetRewardAmount);

        LAFStorageLib.storeClaimableReward(getAssetStorageAddress(), matcher, matcherRewards);
        
        emit AssetRecovered(assetId, assetRewardAmount);
    }
    
    function assetRecoveryFailed(uint256 assetId)
        public
        whenNotPaused
        storageSet
        onlyAssetCreator(assetId)
        onlyAssetStatusMatchConfirmed(assetId)
    {
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint(AssetStatus.Posted));
        LAFStorageLib.storeAssetMatcher(getAssetStorageAddress(), assetId, address(0));
        LAFStorageLib.storeAssetExchangeDetails(getAssetStorageAddress(), assetId, "");
        
        emit RecoveryFailed(assetId);
    }
    
    function cancelAsset(uint256 assetId)
        public
        whenNotPaused
        storageSet
        onlyContractOwnerOrAssetCreator(assetId)
        onlyAssetStatusNotCancelledOrRecovered(assetId)
    {
        // change asset status to cancelled
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint(AssetStatus.Cancelled));
        
        // get asset creator and asset reward amount
        address payable creator = LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId);
        uint256 rewardAmount = LAFStorageLib.getAssetReward(getAssetStorageAddress(), assetId);

        // // creator's current claimable rewards
        // uint256 creatorClaimableRewards = LAFStorageLib.getClaimableReward(getAssetStorageAddress(), creator);
        // creatorClaimableRewards = creatorClaimableRewards.add(rewardAmount);
        // LAFStorageLib.storeClaimableReward(getAssetStorageAddress(), creator, creatorClaimableRewards);

        creator.transfer(rewardAmount);

        emit AssetCancelled(assetId);
    }

    function withdrawRewards()
        public
        whenNotPaused
        storageSet
    {
        uint256 rewardsBalance = LAFStorageLib.getClaimableReward(getAssetStorageAddress(), msg.sender);
        LAFStorageLib.storeClaimableReward(getAssetStorageAddress(), msg.sender, 0);
        msg.sender.transfer(rewardsBalance);
    }
}