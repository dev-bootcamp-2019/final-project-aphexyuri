# Security practices

### Extensive use of modifiers
- item status prevented from progressing in non-valid steps
- role (owner/creator/matcher): restricts functionality by either item creator or matcher (owner in select cases)

### Access whitelist
Storage layer access behind whitelist of callers. Whitelist can only be modified by owner. At deployment, registry contract is added to whitelist

### Withdrawl pattern
Pull-based transfer - gas payed by msg.sender

### Reentrancy guard
Zero out msg.sender's claimable rewards before calling transfer

### Arithmetic Over Flows
Use OpenZeppelin's SafeMath for arithmetic. `add` operation called in Registry Contract's `itemRecovered` method

### Security tools
- Mythril Analysis - No issues found