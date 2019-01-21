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
        bytes32 primaryIpfsDigest,
        uint8 primaryIpfsHashFunction,
        uint8 primaryIpfsSize);
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
        None,
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

    modifier notAssetCreator(uint256 assetId)
    {
        require(msg.sender != LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId));
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

    modifier onlyAssetStatusPostedOrPotentialMatch(uint256 assetId)
    {
        AssetStatus status = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
        require(status == AssetStatus.Posted || status == AssetStatus.PotentialMatch);
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

        LAFStorageLib.storeAssetIfsDigest(getAssetStorageAddress(), assetId, true, ipfsDigest);
        LAFStorageLib.storeAssetIfsHashFunction(getAssetStorageAddress(), assetId, true, ipfsHashFunction);
        LAFStorageLib.storeAssetIfsSize(getAssetStorageAddress(), assetId, true, ipfsSize);

        LAFStorageLib.storeToMyLAFs(getAssetStorageAddress(), msg.sender, assetId);
        
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
            bytes32 primaryIpfsDigest,
            uint8 primaryIpfsHashFunction,
            uint8 primaryIpfsSize
        )
    {
        title = LAFStorageLib.getAssetTitle(getAssetStorageAddress(), assetId);
        isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(getAssetStorageAddress(), assetId);
        stateProvince = LAFStorageLib.getAssetStateProvince(getAssetStorageAddress(), assetId);
        reward = LAFStorageLib.getAssetReward(getAssetStorageAddress(), assetId);
        
        initialAssetType = InitialAssetType(LAFStorageLib.getAssetInitialType(getAssetStorageAddress(), assetId));
        assetStatus = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
        creator = LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId);

        primaryIpfsDigest = LAFStorageLib.getAssetIpfsDigest(getAssetStorageAddress(), assetId, true);
        primaryIpfsHashFunction = LAFStorageLib.getAssetIpfsHashFunction(getAssetStorageAddress(), assetId, true);
        primaryIpfsSize = LAFStorageLib.getAssetIpfsSize(getAssetStorageAddress(), assetId, true);
    }

    function getAssetMetadata(uint256 assetId)
        public
        view
        returns(
            string memory description,
            bytes32 city,
            address matcher,
            string memory foundDetails,
            string memory exchangeDetails,
            bytes32 secondaryIpfsDigest,
            uint8 secondaryIpfsHashFunction,
            uint8 secondaryIpfsSize
        )
    {
        description = LAFStorageLib.getAssetDescription(getAssetStorageAddress(), assetId);
        city = LAFStorageLib.getAssetCity(getAssetStorageAddress(), assetId);
        matcher = LAFStorageLib.getAssetMatcher(getAssetStorageAddress(), assetId);
        foundDetails = LAFStorageLib.getAssetFoundDetails(getAssetStorageAddress(), assetId);
        exchangeDetails = LAFStorageLib.getExchangeDetails(getAssetStorageAddress(), assetId);

        secondaryIpfsDigest = LAFStorageLib.getAssetIpfsDigest(getAssetStorageAddress(), assetId, false);
        secondaryIpfsHashFunction = LAFStorageLib.getAssetIpfsHashFunction(getAssetStorageAddress(), assetId, false);
        secondaryIpfsSize = LAFStorageLib.getAssetIpfsSize(getAssetStorageAddress(), assetId, false);
    }

    function getClaimableRewards()
        public
        view
        returns(uint)
    {
        return LAFStorageLib.getClaimableReward(getAssetStorageAddress(), msg.sender);
    }

    function getMyLAFIndicies()
        public
        view
        returns(uint256[] memory)
    {
        return LAFStorageLib.getMyLAFs(getAssetStorageAddress(), msg.sender);
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

    function foundLostAsset(uint256 assetId, string memory details, bytes32 ipfsDigest, uint8 ipfsHashFunction, uint8 ipfsSize)
        public
        whenNotPaused
        storageSet
        onlyAssetStatusPosted(assetId)
        onlyAssetIntialTypeLost(assetId)
        notAssetCreator(assetId)
    {
        LAFStorageLib.storeAssetStatus(getAssetStorageAddress(), assetId, uint8(AssetStatus.PotentialMatch));
        LAFStorageLib.storeAssetMatcher(getAssetStorageAddress(), assetId, msg.sender);
        LAFStorageLib.storeAssetFoundDetails(getAssetStorageAddress(), assetId, details);

        LAFStorageLib.storeAssetIfsDigest(getAssetStorageAddress(), assetId, false, ipfsDigest);
        LAFStorageLib.storeAssetIfsHashFunction(getAssetStorageAddress(), assetId, false, ipfsHashFunction);
        LAFStorageLib.storeAssetIfsSize(getAssetStorageAddress(), assetId, false, ipfsSize);

        LAFStorageLib.storeToMyLAFs(getAssetStorageAddress(), msg.sender, assetId);
        
        bytes8 isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(getAssetStorageAddress(), assetId);
        bytes8 stateProvince = LAFStorageLib.getAssetStateProvince(getAssetStorageAddress(), assetId);
        
        emit FoundLostAsset(assetId, isoCountryCode, stateProvince);
    }
    
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
        onlyAssetStatusPostedOrPotentialMatch(assetId)
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