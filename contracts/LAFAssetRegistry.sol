pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2; //possible use: returning structs (indexed event params problem)

import "./LAFRegistryBase.sol";
import "./LAFAssetStorage.sol";

/**
 * SETUP:
 * deploy LAFAssetStorage - once only
 * deploy LAFAssetRegistry
 * call setAssetStorageAddress on LAFAssetRegistry with address or storage contract
 * call unpause on LAFAssetRegistry
 * call addAllowedSender on LAFAssetStorage with address of registry contract
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
        bytes8 indexed isoCountryCode,
        bytes8 indexed stateProvince,
        bytes32 city,
        string title,
        InitialAssetType indexed initialAssetType,
        uint256 reward,
        bytes32 ipfsDigest,
        uint8 ipfsHashFunction,
        uint8 ipfsSize);
    event AssetCancelled(uint256 assetId);
    event FoundLostAsset(uint256 assetId, bytes8 indexed isoCountryCode, bytes8 indexed stateProvince);
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
        string memory description,
        bytes8 isoCountryCode,
        bytes8 stateProvince,
        bytes32 city,
        bytes32 ipfsDigest,
        uint8 ipfsHashFunction,
        uint8 ipfsSize
    )
        private
        whenNotPaused
        storageSet
    {
        // get assetid & increment
        uint256 assetId = LAFStorageLib.getAssetCount(getAssetStorageAddress());
        LAFStorageLib.incrementAssetCount(getAssetStorageAddress());
        
        LAFStorageLib.storeAssetTitle(getAssetStorageAddress(), assetId, assetTitle);
        LAFStorageLib.storeAssetDescription(getAssetStorageAddress(), assetId, description);
        
        LAFStorageLib.storeAssetIsoCountryCode(getAssetStorageAddress(), assetId, isoCountryCode);
        LAFStorageLib.storeAssetStateProvince(getAssetStorageAddress(), assetId, stateProvince);
        LAFStorageLib.storeAssetCity(getAssetStorageAddress(), assetId, city);
        
        LAFStorageLib.storeAssetReward(getAssetStorageAddress(), assetId, msg.value);
        LAFStorageLib.storeAssetCreator(getAssetStorageAddress(), assetId, msg.sender);
        
        LAFStorageLib.storeAssetInitialType(getAssetStorageAddress(), assetId, uint8(initialAssetType));
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.Posted));

        LAFStorageLib.storeAssetIfsDigest(getAssetStorageAddress(), assetId, ipfsDigest);
        LAFStorageLib.storeAssetIfsHashFunction(getAssetStorageAddress(), assetId, ipfsHashFunction);
        LAFStorageLib.storeAssetIfsSize(getAssetStorageAddress(), assetId, ipfsSize);
        
        emit AssetStored(
            assetId,
            isoCountryCode,
            stateProvince,
            city,
            assetTitle,
            initialAssetType,
            msg.value,
            ipfsDigest,
            ipfsHashFunction,
            ipfsSize);
    }
    
    // =======================================================
    // PUBLIC API
    // =======================================================
    function getAsset(uint256 assetId)
        public
        view
        returns(
            string memory title,
            bytes8 isoCountryCode,
            bytes8 stateProvince,
            uint256 reward,
            InitialAssetType initialAssetType,
            AssetStatus assetStatus,
            address creator,
            bytes32 ipfsDigest,
            uint8 ipfsHashFunction,
            uint8 ipfsSize
        )
    {
        title = LAFStorageLib.getAssetTitle(getAssetStorageAddress(), assetId);
        isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(getAssetStorageAddress(), assetId);
        stateProvince = LAFStorageLib.getAssetStateProvince(getAssetStorageAddress(), assetId);
        reward = LAFStorageLib.getAssetReward(getAssetStorageAddress(), assetId);
        
        initialAssetType = InitialAssetType(LAFStorageLib.getAssetInitialType(getAssetStorageAddress(), assetId));
        assetStatus = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
        creator = LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId);

        ipfsDigest = LAFStorageLib.getAssetIpfsDigest(getAssetStorageAddress(), assetId);
        ipfsHashFunction = LAFStorageLib.getAssetIpfsHashFunction(getAssetStorageAddress(), assetId);
        ipfsSize = LAFStorageLib.getAssetIpfsSize(getAssetStorageAddress(), assetId);
    }

    function getAssetMetadata(uint256 assetId)
        public
        view
        returns(
            string memory description,
            bytes32 city,
            address matcher
        )
    {
        description = LAFStorageLib.getAssetDescription(getAssetStorageAddress(), assetId);
        city = LAFStorageLib.getAssetCity(getAssetStorageAddress(), assetId);
        matcher = LAFStorageLib.getAssetMatcher(getAssetStorageAddress(), assetId);

        // TODO retrieve exchange data
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
        string memory description,
        bytes8 isoCountryCode,
        bytes8 stateProvince,
        bytes32 city,
        bytes32 ipfsDigest,
        uint8 ipfsHashFunction,
        uint8 ipfsSize
    )
        public
        payable
        whenNotPaused
        storageSet
    {
        newAsset(InitialAssetType.Lost,
            assetTitle,
            description,
            isoCountryCode,
            stateProvince,
            city,
            ipfsDigest,
            ipfsHashFunction,
            ipfsSize);
    }
    
    function newFoundAsset(
        string memory assetTitle,
        string memory description,
        bytes8 isoCountryCode,
        bytes8 stateProvince,
        bytes32 city,
        bytes32 ipfsDigest,
        uint8 ipfsHashFunction,
        uint8 ipfsSize
    )
        public
        payable
        whenNotPaused
        storageSet
    {
        newAsset(InitialAssetType.Found,
            assetTitle,
            description,
            isoCountryCode,
            stateProvince,
            city,
            ipfsDigest,
            ipfsHashFunction,
            ipfsSize);
    }

    function foundLostAsset(uint256 assetId)
        public
        whenNotPaused
        storageSet
        onlyAssetStatusPosted(assetId)
        onlyAssetIntialTypeLost(assetId)
    {
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.PotentialMatch));
        LAFStorageLib.storeAssetMatcher(getAssetStorageAddress(), assetId, msg.sender);
        
        bytes8 isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(getAssetStorageAddress(), assetId);
        bytes8 stateProvince = LAFStorageLib.getAssetStateProvince(getAssetStorageAddress(), assetId);
        
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
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.MatchConfirmed));

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
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.Posted));
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
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.Recovered));
        
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
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.Posted));
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
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.Cancelled));
        
        // get asset creator and asset reward amount
        address payable creator = LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId);
        uint256 rewardAmount = LAFStorageLib.getAssetReward(getAssetStorageAddress(), assetId);

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