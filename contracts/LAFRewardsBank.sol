pragma solidity ^0.5.0

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
// import "./Ownable.sol"; // remix import

contract LAFRewardsBank is Ownable
{
    mapping(address payable => uint) balances;

    event Withdrawal(address, uint, uint);
    
    /// @notice Deposit ether
    /// @return Balance of the user after deposit
    function deposit()
        public
        payable
        returns(uint)
    {
        balances[msg.sender] += msg.value;

        return balances[msg.sender];
    }

    /// @notice Transfers ether to someone else
    /// @param recipient Recipeint of transfer
    /// @param transferAmount amount to transfer
    /// @return New balances of sender and recipient
    function transfer(address payable recipient, uint transferAmount)
        public
        return (uint, uint)
    {
        // ensure user has sufficient balance
        require(blances[msg.sender] >= transferAmount);

        // transfer to recipient
        blances[msg.sender] -= transferAmount;
        blances[recipient] =+ transferAmount;

        return (blances[msg.sender], blances[recipient]);
    }

    /// @notice Withdraw ether
    /// @dev Does not return any excess ether sent
    /// @param withdrawAmount amount to withdraw
    /// @return New balance for
    function withdraw(uint withdrawAmount)
        public
        returns (uint)
    {
        // ensure user has sufficient balance
        require(balances[msg.sender] >= withdrawAmount);

        // transfer funds
        msg.sender.transfer(withdrawAmount);

        // decrement user's balance
        balances[msg.sender] -= withdrawAmount;

         // emit event
        emit LogWithdrawal(msg.sender, withdrawAmount, balances[msg.sender]);

         // return new balance
        return balances[msg.sender];
    }

    function() external {
        revert();
    }
}