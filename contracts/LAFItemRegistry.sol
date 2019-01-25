pragma solidity ^0.5.0;

import "./LAFRegistryBase.sol";
import "./LAFItemStorage.sol";

/// @title Registry contract
contract LAFItemRegistry is LAFRegistryBase
{
    // =======================================================
    // EVENTS
    // =======================================================
    event ItemStored(
        uint256 itemId,
        bytes8 indexed isoCountryCode,
        bytes8 indexed stateProvince,
        bytes32 city,
        string title,
        InitialItemType indexed initialItemType,
        uint256 reward,
        bytes32 primaryIpfsDigest,
        uint8 primaryIpfsHashFunction,
        uint8 primaryIpfsSize);
    event ItemCancelled(uint256 itemId);
    event FoundLostItem(uint256 itemId, bytes8 indexed isoCountryCode, bytes8 indexed stateProvince);
    event MatchConfirmed(uint256 itemId);
    event MatchInvalid(uint256 itemId);
    event ItemRecovered(uint256 itemId, uint256 reward);
    event RecoveryFailed(uint256 itemId);
    event Withdrawl(uint256 contractBalance, address payee);
    
    // =======================================================
    // STRUCTS
    // =======================================================
    /// @dev Item can be added to the system in either a Lost of foudn state
    enum InitialItemType
    {
        Lost,
        Found
    }
    
    /// @dev Possible states/statusses of item
    enum ItemStatus
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
    /// @dev ensures msg.sender is either the contract owner or creator of item with provided id
    modifier onlyContractOwnerOrItemCreator(uint256 itemId)
    {
        require(msg.sender == owner() || msg.sender == LAFStorageLib.getItemCreator(getItemStorageAddress(), itemId),
            "Only allowed by owner or creator");
        _;
    }
    
    /// @dev ensures msg.sender is the creator of item with provided ID
    modifier onlyItemCreator(uint256 itemId)
    {
        require(msg.sender == LAFStorageLib.getItemCreator(getItemStorageAddress(), itemId),
            "Only allowed by creator");
        _;
    }

    /// @dev ensures msg.sender is the creator of item with provided ID
    modifier notItemCreator(uint256 itemId)
    {
        require(msg.sender != LAFStorageLib.getItemCreator(getItemStorageAddress(), itemId),
            "Needs to not be creator");
        _;
    }

    /// @dev ensures msg.sender is the 2nd party on item, a.k.a. item matcher
    modifier onlyItemMatcher(uint256 itemId)
    {
        require(msg.sender == LAFStorageLib.getItemMatcher(getItemStorageAddress(), itemId),
            "Only item matcher");
        _;
    }
    
    /// @dev ensures item with provided ID has Posted status
    modifier onlyItemStatusPosted(uint256 itemId)
    {
        require(ItemStatus(LAFStorageLib.getItemStatus(getItemStorageAddress(), itemId)) == ItemStatus.Posted,
            "Item doesn't have Posted status");
        _;
    }
    
    /// @dev ensures item with provided ID has PotentialMatch status
    modifier onlyItemStatusPotentialMatch(uint256 itemId)
    {
        require(ItemStatus(LAFStorageLib.getItemStatus(getItemStorageAddress(), itemId)) == ItemStatus.PotentialMatch,
            "Item doesn't have PotentialMatch status");
        _;
    }
    
    /// @dev ensures item with provided ID has MatchConfirmed status
    modifier onlyItemStatusMatchConfirmed(uint256 itemId)
    {
        require(ItemStatus(LAFStorageLib.getItemStatus(getItemStorageAddress(), itemId)) == ItemStatus.MatchConfirmed,
            "Item doesn't have MatchConfirmed status");
        _;
    }

    /// @dev ensures item with provided ID has either Posted or PotentialMatch statuses
    modifier onlyItemStatusPostedOrPotentialMatch(uint256 itemId)
    {
        ItemStatus status = ItemStatus(LAFStorageLib.getItemStatus(getItemStorageAddress(), itemId));
        require(status == ItemStatus.Posted || status == ItemStatus.PotentialMatch,
            "Item doesn't have Posted or PotentialMatch status");
        _;
    }

    /// @dev ensures item with provided ID has Recovered status
    modifier onlyItemRecovered(uint256 itemId)
    {
        ItemStatus status = ItemStatus(LAFStorageLib.getItemStatus(getItemStorageAddress(), itemId));
        require(status == ItemStatus.Recovered,
            "Item doesn't have Recovered status");
        _;
    }

    /// @dev ensures item with provided ID has initia type of Lost
    modifier onlyItemIntialTypeLost(uint256 itemId)
    {
        InitialItemType initialItemType = InitialItemType(LAFStorageLib.getItemInitialType(getItemStorageAddress(), itemId));
        require(initialItemType == InitialItemType.Lost,
            "Item's initial type must be Lost");
        _;
    }
    
    // =======================================================
    // INTERNAL / PRIVATE API
    // =======================================================
    /// @notice Internal method
    /// @dev Creates a new item
    /// @param initialItemType Initial item type enum
    /// @param itemTitle Title of item
    /// @param description Details & description
    /// @param isoCountryCode Title of item
    /// @param stateProvince State/Province of item
    /// @param city City of item
    /// @param primaryIpfsDigest IPFS Mutihash-digest
    /// @param primaryIpfsHashFunction IPFS Mutihash-hash function
    /// @param primaryIpfsSize IPFS Mutihash-size
    function newItem(
        InitialItemType initialItemType,
        string memory itemTitle,
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
        // get itemid & increment
        uint256 itemId = LAFStorageLib.getItemCount(getItemStorageAddress());
        LAFStorageLib.incrementItemCount(getItemStorageAddress());
        
        LAFStorageLib.storeItemTitle(getItemStorageAddress(), itemId, itemTitle);
        LAFStorageLib.storeItemDescription(getItemStorageAddress(), itemId, description);
        
        LAFStorageLib.storeItemIsoCountryCode(getItemStorageAddress(), itemId, isoCountryCode);
        LAFStorageLib.storeItemStateProvince(getItemStorageAddress(), itemId, stateProvince);
        LAFStorageLib.storeItemCity(getItemStorageAddress(), itemId, city);
        
        LAFStorageLib.storeItemReward(getItemStorageAddress(), itemId, msg.value);
        LAFStorageLib.storeItemCreator(getItemStorageAddress(), itemId, msg.sender);
        
        LAFStorageLib.storeItemInitialType(getItemStorageAddress(), itemId, uint8(initialItemType));
        LAFStorageLib.storeItemStatus(getItemStorageAddress(), itemId, uint8(ItemStatus.Posted));

        LAFStorageLib.storeItemIfsDigest(getItemStorageAddress(), itemId, true, primaryIpfsDigest);
        LAFStorageLib.storeItemIfsHashFunction(getItemStorageAddress(), itemId, true, primaryIpfsHashFunction);
        LAFStorageLib.storeItemIfsSize(getItemStorageAddress(), itemId, true, primaryIpfsSize);

        LAFStorageLib.storeToMyLAFs(getItemStorageAddress(), msg.sender, itemId);
        
        emit ItemStored(
            itemId,
            isoCountryCode,
            stateProvince,
            city,
            itemTitle,
            initialItemType,
            msg.value,
            primaryIpfsDigest,
            primaryIpfsHashFunction,
            primaryIpfsSize);
    }
    
    // =======================================================
    // PUBLIC API
    // =======================================================
    /// @dev Retrieves main item details
    /// @param itemId ID of the item
    /// @return itemTitle Title of item
    /// @return initialItemType Initial item type enum
    /// @return itemStatus Initial item status
    /// @return isoCountryCode Title of item
    /// @return stateProvince State/Province of item
    /// @return creator Address of creator
    /// @return reward Reward offered for recovery
    /// @return primaryIpfsDigest IPFS Mutihash-digest (original posting)
    /// @return primaryIpfsHashFunction IPFS Mutihash-hash function (original posting)
    /// @return primaryIpfsSize IPFS Mutihash-size (original posting)
    function getItem(uint256 itemId)
        public
        view
        returns(
            string memory itemTitle,
            InitialItemType initialItemType,
            ItemStatus itemStatus,
            bytes8 isoCountryCode,
            bytes8 stateProvince,
            address creator,
            uint256 reward,
            bytes32 primaryIpfsDigest,
            uint8 primaryIpfsHashFunction,
            uint8 primaryIpfsSize
        )
    {
        itemTitle = LAFStorageLib.getItemTitle(getItemStorageAddress(), itemId);
        isoCountryCode = LAFStorageLib.getItemIsoCountryCode(getItemStorageAddress(), itemId);
        stateProvince = LAFStorageLib.getItemStateProvince(getItemStorageAddress(), itemId);
        reward = LAFStorageLib.getItemReward(getItemStorageAddress(), itemId);
        
        initialItemType = InitialItemType(LAFStorageLib.getItemInitialType(getItemStorageAddress(), itemId));
        itemStatus = ItemStatus(LAFStorageLib.getItemStatus(getItemStorageAddress(), itemId));
        creator = LAFStorageLib.getItemCreator(getItemStorageAddress(), itemId);

        primaryIpfsDigest = LAFStorageLib.getItemIpfsDigest(getItemStorageAddress(), itemId, true);
        primaryIpfsHashFunction = LAFStorageLib.getItemIpfsHashFunction(getItemStorageAddress(), itemId, true);
        primaryIpfsSize = LAFStorageLib.getItemIpfsSize(getItemStorageAddress(), itemId, true);
    }

    /// @dev Retrieves item meta/additional data
    /// @param itemId ID of the item
    /// @return description Details & description
    /// @return city City of item
    /// @return matcher Address of 2nd party
    /// @return foundDetails Details provided by 2nd party
    /// @return exchangeDetails Exchange details provide by creator
    /// @return secondaryIpfsDigest IPFS Mutihash-digest (2nd party posting)
    /// @return secondaryIpfsHashFunction PFS Mutihash-hash function (2nd party posting)
    /// @return secondaryIpfsSize IPFS Mutihash-size (2nd party posting)
    function getItemMetadata(uint256 itemId)
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
        description = LAFStorageLib.getItemDescription(getItemStorageAddress(), itemId);
        city = LAFStorageLib.getItemCity(getItemStorageAddress(), itemId);
        matcher = LAFStorageLib.getItemMatcher(getItemStorageAddress(), itemId);
        foundDetails = LAFStorageLib.getItemFoundDetails(getItemStorageAddress(), itemId);
        exchangeDetails = LAFStorageLib.getExchangeDetails(getItemStorageAddress(), itemId);

        secondaryIpfsDigest = LAFStorageLib.getItemIpfsDigest(getItemStorageAddress(), itemId, false);
        secondaryIpfsHashFunction = LAFStorageLib.getItemIpfsHashFunction(getItemStorageAddress(), itemId, false);
        secondaryIpfsSize = LAFStorageLib.getItemIpfsSize(getItemStorageAddress(), itemId, false);
    }

    /// @dev Retrieves the claimable rewards for msg.sender
    /// @return Claimable rewards in wei
    function getClaimableRewards()
        public
        view
        returns(uint)
    {
        return LAFStorageLib.getClaimableReward(getItemStorageAddress(), msg.sender);
    }

    /// @dev Retrieves uint array of all indicies msg.sender has interacted with
    /// @return An array of item IDs
    function getMyLAFIndicies()
        public
        view
        returns(uint256[] memory)
    {
        return LAFStorageLib.getMyLAFs(getItemStorageAddress(), msg.sender);
    }
    
    /// @dev Creates a new lost item
    /// @param itemTitle Title of item
    /// @param description Details & description
    /// @param isoCountryCode Title of item
    /// @param stateProvince State/Province of item
    /// @param city City of item
    /// @param primaryIpfsDigest IPFS Mutihash-digest (original posting)
    /// @param primaryIpfsHashFunction IPFS Mutihash-hash function (original posting)
    /// @param primaryIpfsSize IPFS Mutihash-size (original posting)
    function newLostItem(
        string memory itemTitle,
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
        newItem(InitialItemType.Lost,
            itemTitle,
            description,
            isoCountryCode,
            stateProvince,
            city,
            primaryIpfsDigest,
            primaryIpfsHashFunction,
            primaryIpfsSize);
    }

    /// @dev Lost item has potentially been found
    /// @param itemId ID of the item
    /// @param details Details & description
    /// @param secondaryIpfsDigest IPFS Mutihash-digest (2nd party posting)
    /// @param secondaryIpfsHashFunction IPFS Mutihash-hash function (2nd party posting)
    /// @param secondaryIpfsSize IPFS Mutihash-size (2nd party posting)
    function foundLostItem(uint256 itemId, string memory details, bytes32 secondaryIpfsDigest, uint8 secondaryIpfsHashFunction, uint8 secondaryIpfsSize)
        public
        whenNotPaused
        storageSet
        onlyItemStatusPosted(itemId)
        onlyItemIntialTypeLost(itemId)
        notItemCreator(itemId)
    {
        LAFStorageLib.storeItemStatus(getItemStorageAddress(), itemId, uint8(ItemStatus.PotentialMatch));
        LAFStorageLib.storeItemMatcher(getItemStorageAddress(), itemId, msg.sender);
        LAFStorageLib.storeItemFoundDetails(getItemStorageAddress(), itemId, details);

        LAFStorageLib.storeItemIfsDigest(getItemStorageAddress(), itemId, false, secondaryIpfsDigest);
        LAFStorageLib.storeItemIfsHashFunction(getItemStorageAddress(), itemId, false, secondaryIpfsHashFunction);
        LAFStorageLib.storeItemIfsSize(getItemStorageAddress(), itemId, false, secondaryIpfsSize);

        LAFStorageLib.storeToMyLAFs(getItemStorageAddress(), msg.sender, itemId);
        
        bytes8 isoCountryCode = LAFStorageLib.getItemIsoCountryCode(getItemStorageAddress(), itemId);
        bytes8 stateProvince = LAFStorageLib.getItemStateProvince(getItemStorageAddress(), itemId);
        
        emit FoundLostItem(itemId, isoCountryCode, stateProvince);
    }
    
    /// @dev Method for creator to verify item has been foundy 2nd party
    /// @param itemId ID of the item
    /// @param exchangeDetails Date, time, [public] place/location where item should be taken
    function matchConfirmed(uint256 itemId, string memory exchangeDetails)
        public
        whenNotPaused
        storageSet
        onlyItemCreator(itemId)
        onlyItemStatusPotentialMatch(itemId)
    {
        LAFStorageLib.storeItemStatus(getItemStorageAddress(), itemId, uint8(ItemStatus.MatchConfirmed));

        if(bytes(exchangeDetails).length > 0)
        {
            LAFStorageLib.storeItemExchangeDetails(getItemStorageAddress(), itemId, exchangeDetails);
        }

        emit MatchConfirmed(itemId);
    }
    
    /// @dev Method for creator to reject 2nd party's claim that the item has been found
    /// @param itemId ID of the item
    function matchInvalid(uint256 itemId)
        public
        whenNotPaused
        storageSet
        onlyItemCreator(itemId)
        onlyItemStatusPotentialMatch(itemId)
    {
        LAFStorageLib.storeItemStatus(getItemStorageAddress(), itemId, uint8(ItemStatus.Posted));
        LAFStorageLib.storeItemMatcher(getItemStorageAddress(), itemId, address(0));
        
        emit MatchInvalid(itemId);
    }
    
    /// @dev Method for creator to verify after item has been recovered
    /// @notice This will make reward available for withdrawl by matcher/(2nd party)
    /// @param itemId ID of the item
    function itemRecovered(uint256 itemId)
        public
        whenNotPaused
        storageSet
        onlyItemCreator(itemId)
        onlyItemStatusMatchConfirmed(itemId)
    {
        LAFStorageLib.storeItemStatus(getItemStorageAddress(), itemId, uint8(ItemStatus.Recovered));
        
        address payable matcher = LAFStorageLib.getItemMatcher(getItemStorageAddress(), itemId);
        uint256 itemRewardAmount = LAFStorageLib.getItemReward(getItemStorageAddress(), itemId);
        uint256 matcherRewards = LAFStorageLib.getClaimableReward(getItemStorageAddress(), matcher);
        matcherRewards = matcherRewards.add(itemRewardAmount);

        LAFStorageLib.storeClaimableReward(getItemStorageAddress(), matcher, matcherRewards);
        
        emit ItemRecovered(itemId, itemRewardAmount);
    }
    
    /// @dev Method for creator when item recovery failed
    /// @notice This will revert item to Posted status
    /// @param itemId ID of the item
    function itemRecoveryFailed(uint256 itemId)
        public
        whenNotPaused
        storageSet
        onlyItemCreator(itemId)
        onlyItemStatusMatchConfirmed(itemId)
    {
        LAFStorageLib.storeItemStatus(getItemStorageAddress(), itemId, uint8(ItemStatus.Posted));
        LAFStorageLib.storeItemMatcher(getItemStorageAddress(), itemId, address(0));
        LAFStorageLib.storeItemExchangeDetails(getItemStorageAddress(), itemId, "");
        
        emit RecoveryFailed(itemId);
    }
    
    /// @dev Method for creator to cancel an item
    /// @param itemId ID of the item
    function cancelItem(uint256 itemId)
        public
        whenNotPaused
        storageSet
        onlyContractOwnerOrItemCreator(itemId)
        onlyItemStatusPostedOrPotentialMatch(itemId)
    {
        // change item status to cancelled
        LAFStorageLib.storeItemStatus(getItemStorageAddress(), itemId, uint8(ItemStatus.Cancelled));
        
        // get item creator and item reward amount
        address payable creator = LAFStorageLib.getItemCreator(getItemStorageAddress(), itemId);
        uint256 rewardAmount = LAFStorageLib.getItemReward(getItemStorageAddress(), itemId);

        creator.transfer(rewardAmount);

        emit ItemCancelled(itemId);
    }

    /// @dev Method for msg.sender to withdraw ETH(wei) claimable rewards
    function withdrawRewards()
        public
        whenNotPaused
        storageSet
    {
        uint256 rewardsBalance = LAFStorageLib.getClaimableReward(getItemStorageAddress(), msg.sender);

        require(address(this).balance >= rewardsBalance);

        LAFStorageLib.storeClaimableReward(getItemStorageAddress(), msg.sender, 0);
        msg.sender.transfer(rewardsBalance);

        emit Withdrawl(address(this).balance, msg.sender);
    }
}