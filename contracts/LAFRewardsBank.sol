pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// import "./SafeMath.sol"; // remix import

contract LAFRewardsBank is Ownable
{
    using SafeMath for uint;

    address public allowedDepositor;

    mapping(address => uint) balances;

    event Deposit(address, uint);
    event Transfer(address, uint, address);
    event Withdrawal(address, uint, uint);

    // =======================================================
    // MODIFIERS
    // =======================================================
    modifier onlyFromAssetRegistry()
    {
        require(msg.sender == allowedDepositor);
        _;
    }

    // =======================================================
    // API
    // =======================================================
    /// @notice Deposit ether that for reward. Can also be called for donations from any wallet
    /// @param sender Address making the deposit
    /// @param rewardAmount Reward amount in wei
    /// @return New balances of depositor
    function depositReward(address sender, uint rewardAmount)
        public
        payable
        returns(uint)
    {
        // ensure depositor is valid
        require(sender != address(0));

        // place reward in depositor account
        balances[sender].add(rewardAmount);

        return balances[sender];
    }

    /// @notice Transfers ether to someone else
    /// @dev Great care should be taken to ensure integrity of making always caled behind msg.sender checks (in this case the onlyFromAssetRegistry modifier)
    /// @param transferSender Initialitor/sender of transfer
    /// @param transferAmount Amount to transfer in wei
    /// @param transferRecipient Recipeint of transfer
    /// @return New balances of sender and recipient
    function transferTo(address transferSender, uint transferAmount, address payable transferRecipient)
        public
        onlyFromAssetRegistry
        returns (uint, uint)
    {
        // ensure user has sufficient balance
        require(balances[transferSender] >= transferAmount);

        // deduct from sender; add to recipient
        balances[transferSender].sub(transferAmount);
        balances[transferRecipient].add(transferAmount);

        emit Transfer(transferSender, transferAmount, transferRecipient);

        return (balances[transferSender], balances[transferRecipient]);
    }

    /// @notice Withdraw ether
    /// @dev Does not return any excess ether sent
    /// @param withdrawAmount Amount to withdraw in wei
    /// @return New balance for
    function withdrawReward(uint withdrawAmount)
        public
        returns (uint)
    {
        require(balances[msg.sender] >= withdrawAmount);

        // decrement user balance
        balances[msg.sender].sub(withdrawAmount);

        // transfer funds
        msg.sender.transfer(withdrawAmount);

         // emit event
        emit Withdrawal(msg.sender, withdrawAmount, balances[msg.sender]);

         // return new balance
        return balances[msg.sender];
    }

    /// @notice Cancels a reward and refunds funds
    /// @dev Coincides with cancelAsset from Registry
    /// @param rewardAmount Amount to withdraw in wei
    /// @return New balance for
    function cancelReward(address payable holder, uint rewardAmount)
        public
        onlyFromAssetRegistry
    {
        // ensure holder address is valid
        require(holder != address(0));

        // ensure holder has suffifcient balance
        require(balances[holder] >= rewardAmount);

        balances[holder].sub(rewardAmount);

        holder.transfer(rewardAmount);
    }

    function() external {
        revert();
    }
}