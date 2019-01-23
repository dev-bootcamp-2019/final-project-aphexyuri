pragma solidity ^0.5.0;
// pragma experimental ABIEncoderV2; //possible use: returning structs (indexed event params problem)

import "./LAFRegistryBase.sol";
import "./LAFAssetStorage.sol";

/// @title Registry contract
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
    event Withdrawl(uint256 contractBalance, address payee);
    
    // =======================================================
    // STRUCTS
    // =======================================================
    /// @dev Asset can be added to the system in either a Lost of foudn state
    enum InitialAssetType
    {
        Lost,
        Found
    }
    
    /// @dev Possible states/statusses of asset
    enum AssetStatus
    {
        None,
        Posted,
        PotentialMatch,
        MatchConfirmed,
        Recovered,
        Cancelled
    }

    constructor()
        public
    {
        version = 1;
    }

    // =======================================================
    // MODIFIERS
    // =======================================================
    /// @dev ensures msg.sender is either the contract owner or creator of asset with provided id
    modifier onlyContractOwnerOrAssetCreator(uint256 assetId)
    {
        require(msg.sender == owner() || msg.sender == LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId));
        _;
    }
    
    /// @dev ensures msg.sender is the creator of asset with provided ID
    modifier onlyAssetCreator(uint256 assetId)
    {
        require(msg.sender == LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId));
        _;
    }

    /// @dev ensures msg.sender is the creator of asset with provided ID
    modifier notAssetCreator(uint256 assetId)
    {
        require(msg.sender != LAFStorageLib.getAssetCreator(getAssetStorageAddress(), assetId));
        _;
    }

    /// @dev ensures msg.sender is the 2nd party on asset, a.k.a. asset matcher
    modifier onlyAssetMatcher(uint256 assetId)
    {
        require(msg.sender == LAFStorageLib.getAssetMatcher(getAssetStorageAddress(), assetId));
        _;
    }
    
    /// @dev ensures asset with provided ID has Posted status
    modifier onlyAssetStatusPosted(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId)) == AssetStatus.Posted);
        _;
    }
    
    /// @dev ensures asset with provided ID has PotentialMatch status
    modifier onlyAssetStatusPotentialMatch(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId)) == AssetStatus.PotentialMatch);
        _;
    }
    
    /// @dev ensures asset with provided ID has MatchConfirmed status
    modifier onlyAssetStatusMatchConfirmed(uint256 assetId)
    {
        require(AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId)) == AssetStatus.MatchConfirmed);
        _;
    }

    /// @dev ensures asset with provided ID has either Posted or PotentialMatch statuses
    modifier onlyAssetStatusPostedOrPotentialMatch(uint256 assetId)
    {
        AssetStatus status = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
        require(status == AssetStatus.Posted || status == AssetStatus.PotentialMatch);
        _;
    }

    /// @dev ensures asset with provided ID has Recovered status
    modifier onlyAssetRecovered(uint256 assetId)
    {
        AssetStatus status = AssetStatus(LAFStorageLib.getAssetStatus(getAssetStorageAddress(), assetId));
        require(status == AssetStatus.Recovered);
        _;
    }

    /// @dev ensures asset with provided ID has initia type of Lost
    modifier onlyAssetIntialTypeLost(uint256 assetId)
    {
        InitialAssetType initialAssetType = InitialAssetType(LAFStorageLib.getAssetInitialType(getAssetStorageAddress(), assetId));
        require(initialAssetType == InitialAssetType.Lost);
        _;
    }
    
    // =======================================================
    // INTERNAL / PRIVATE API
    // =======================================================
    /// @notice Internal method
    /// @dev Creates a new asset
    /// @param initialAssetType Initial asset type enum
    /// @param assetTitle Title of asset
    /// @param description Details & description
    /// @param isoCountryCode Title of asset
    /// @param stateProvince State/Province of asset
    /// @param city City of asset
    /// @param primaryIpfsDigest IPFS Mutihash-digest
    /// @param primaryIpfsHashFunction IPFS Mutihash-hash function
    /// @param primaryIpfsSize IPFS Mutihash-size
    function newAsset(
        InitialAssetType initialAssetType,
        string memory assetTitle,
        string memory description,
        bytes8 isoCountryCode,
        bytes8 stateProvince,
        bytes32 city,
        bytes32 primaryIpfsDigest,
        uint8 primaryIpfsHashFunction,
        uint8 primaryIpfsSize
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

        LAFStorageLib.storeAssetIfsDigest(getAssetStorageAddress(), assetId, true, primaryIpfsDigest);
        LAFStorageLib.storeAssetIfsHashFunction(getAssetStorageAddress(), assetId, true, primaryIpfsHashFunction);
        LAFStorageLib.storeAssetIfsSize(getAssetStorageAddress(), assetId, true, primaryIpfsSize);

        LAFStorageLib.storeToMyLAFs(getAssetStorageAddress(), msg.sender, assetId);
        
        emit AssetStored(
            assetId,
            isoCountryCode,
            stateProvince,
            city,
            assetTitle,
            initialAssetType,
            msg.value,
            primaryIpfsDigest,
            primaryIpfsHashFunction,
            primaryIpfsSize);
    }
    
    // =======================================================
    // PUBLIC API
    // =======================================================
    /// @dev Retrieves main asset details
    /// @param assetId ID of the asset
    /// @return assetTitle Title of asset
    /// @return initialAssetType Initial asset type enum
    /// @return assetStatus Initial asset status
    /// @return isoCountryCode Title of asset
    /// @return stateProvince State/Province of asset
    /// @return creator Address of creator
    /// @return reward Reward offered for recovery
    /// @return primaryIpfsDigest IPFS Mutihash-digest (original posting)
    /// @return primaryIpfsHashFunction IPFS Mutihash-hash function (original posting)
    /// @return primaryIpfsSize IPFS Mutihash-size (original posting)
    function getAsset(uint256 assetId)
        public
        view
        returns(
            string memory assetTitle,
            InitialAssetType initialAssetType,
            AssetStatus assetStatus,
            bytes8 isoCountryCode,
            bytes8 stateProvince,
            address creator,
            uint256 reward,
            bytes32 primaryIpfsDigest,
            uint8 primaryIpfsHashFunction,
            uint8 primaryIpfsSize
        )
    {
        assetTitle = LAFStorageLib.getAssetTitle(getAssetStorageAddress(), assetId);
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

    /// @dev Retrieves asset meta/additional data
    /// @param assetId ID of the asset
    /// @return description Details & description
    /// @return city City of asset
    /// @return matcher Address of 2nd party
    /// @return foundDetails Details provided by 2nd party
    /// @return exchangeDetails Exchange details provide by creator
    /// @return secondaryIpfsDigest IPFS Mutihash-digest (2nd party posting)
    /// @return secondaryIpfsHashFunction PFS Mutihash-hash function (2nd party posting)
    /// @return secondaryIpfsSize IPFS Mutihash-size (2nd party posting)
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

    /// @dev Retrieves the claimable rewards for msg.sender
    /// @return Claimable rewards in wei
    function getClaimableRewards()
        public
        view
        returns(uint)
    {
        return LAFStorageLib.getClaimableReward(getAssetStorageAddress(), msg.sender);
    }

    /// @dev Retrieves uint array of all indicies msg.sender has interacted with
    /// @return An array of asset IDs
    function getMyLAFIndicies()
        public
        view
        returns(uint256[] memory)
    {
        return LAFStorageLib.getMyLAFs(getAssetStorageAddress(), msg.sender);
    }
    
    /// @dev Creates a new lost asset
    /// @param assetTitle Title of asset
    /// @param description Details & description
    /// @param isoCountryCode Title of asset
    /// @param stateProvince State/Province of asset
    /// @param city City of asset
    /// @param primaryIpfsDigest IPFS Mutihash-digest (original posting)
    /// @param primaryIpfsHashFunction IPFS Mutihash-hash function (original posting)
    /// @param primaryIpfsSize IPFS Mutihash-size (original posting)
    function newLostAsset(
        string memory assetTitle,
        string memory description,
        bytes8 isoCountryCode,
        bytes8 stateProvince,
        bytes32 city,
        bytes32 primaryIpfsDigest,
        uint8 primaryIpfsHashFunction,
        uint8 primaryIpfsSize
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
            primaryIpfsDigest,
            primaryIpfsHashFunction,
            primaryIpfsSize);
    }

    /// @dev Lost asset has potentially been found
    /// @param assetId ID of the asset
    /// @param details Details & description
    /// @param secondaryIpfsDigest IPFS Mutihash-digest (2nd party posting)
    /// @param secondaryIpfsHashFunction IPFS Mutihash-hash function (2nd party posting)
    /// @param secondaryIpfsSize IPFS Mutihash-size (2nd party posting)
    function foundLostAsset(uint256 assetId, string memory details, bytes32 secondaryIpfsDigest, uint8 secondaryIpfsHashFunction, uint8 secondaryIpfsSize)
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

        LAFStorageLib.storeAssetIfsDigest(getAssetStorageAddress(), assetId, false, secondaryIpfsDigest);
        LAFStorageLib.storeAssetIfsHashFunction(getAssetStorageAddress(), assetId, false, secondaryIpfsHashFunction);
        LAFStorageLib.storeAssetIfsSize(getAssetStorageAddress(), assetId, false, secondaryIpfsSize);

        LAFStorageLib.storeToMyLAFs(getAssetStorageAddress(), msg.sender, assetId);
        
        bytes8 isoCountryCode = LAFStorageLib.getAssetIsoCountryCode(getAssetStorageAddress(), assetId);
        bytes8 stateProvince = LAFStorageLib.getAssetStateProvince(getAssetStorageAddress(), assetId);
        
        emit FoundLostAsset(assetId, isoCountryCode, stateProvince);
    }
    
    /// @dev Method for creator to verify assst has been foundy 2nd party
    /// @param assetId ID of the asset
    /// @param exchangeDetails Date, time, [public] place/location where asset should be taken
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
    
    /// @dev Method for creator to reject 2nd party's claim that the asset has been found
    /// @param assetId ID of the asset
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
    
    /// @dev Method for creator to verify after asset has been recovered
    /// @notice This will make reward available for withdrawl by matcher/(2nd party)
    /// @param assetId ID of the asset
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
    
    /// @dev Method for creator when asset recovery failed
    /// @notice This will revert asset to Posted status
    /// @param assetId ID of the asset
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
    
    /// @dev Method for creator to cancel an asset
    /// @param assetId ID of the asset
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

    /// @dev Method for msg.sender to withdraw ETH(wei) claimable rewards
    function withdrawRewards()
        public
        whenNotPaused
        storageSet
    {
        uint256 rewardsBalance = LAFStorageLib.getClaimableReward(getAssetStorageAddress(), msg.sender);

        require(address(this).balance >= rewardsBalance);

        LAFStorageLib.storeClaimableReward(getAssetStorageAddress(), msg.sender, 0);
        msg.sender.transfer(rewardsBalance);

        emit Withdrawl(address(this).balance, msg.sender);
    }
}