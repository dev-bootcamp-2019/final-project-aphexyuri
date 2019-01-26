# Avoiding Common Attacks

### Use of modifiers
Extensive use of modifiers are in place to ensure items transition between state as designed. Additionally, these modifiers enforce item creator/owner ability to transition through these states:
- item status prevented from progressing in non-valid steps
- role (owner/creator/matcher): restricts functionality by either item creator or matcher (owner in select cases)

### Storage Access via whitelist
Storage layer access behind whitelist of callers - Registry contracts are the valid callers. Whitelist can only be modified by owner. At deployment, a registry contract is added to whitelist

### Reentrancy guard
Zero out msg.sender's claimable rewards before calling transfer

### Arithmetic Over Flows
Use OpenZeppelin's SafeMath for arithmetic. `add` operation called in Registry Contract's `itemRecovered` method

### Forced ether sending
Even though it has no impact on functionality, I implemented a fallback function that reverts to avoid the situation of wrongful or malicious ether sending

### Security tools
- Mythril Analysis - No issues found