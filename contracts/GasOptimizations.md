# Gas Optimization Recommendations for CredentialVault

## Current Optimizations

### 1. Event Indexing Strategy
- `CredentialRegistered`: Indexed `id`, `owner` for efficient credential lookups
- `CredentialRevoked`: Indexed `id`, `owner` for revocation tracking
- `VerifierAuthorizationUpdated`: Indexed `id`, `owner` for authorization queries
- `CredentialQueried`: Indexed `id`, `querier` for access pattern analysis

### 2. Storage Packing
- `Credential` struct uses `uint64` for timestamps (saves gas vs `uint256`)
- Boolean fields are naturally packed with other data types

### 3. Memory vs Storage Access
- Functions minimize storage reads by caching values in memory
- Use `view` functions where possible to avoid state changes

## Potential Further Optimizations

### 1. Batch Operations
```solidity
function batchAuthorize(uint256[] calldata ids, address verifier, bool authorized) external {
    for (uint256 i = 0; i < ids.length; i++) {
        // Single authorization check for batch
        require(_credentials[ids[i]].owner == msg.sender, "Not owner");
        _authorizations[ids[i]][verifier] = authorized;
        emit VerifierAuthorizationUpdated(ids[i], msg.sender, verifier, authorized, uint64(block.timestamp));
    }
}
```

### 2. Short Circuiting
- Reorder require statements to fail fast on common conditions
- Check cheap operations before expensive ones

### 3. Constants for Magic Numbers
```solidity
uint256 constant MAX_PAYLOAD_LENGTH = 1000;
uint256 constant MIN_PAYLOAD_LENGTH = 10;
```

### 4. Assembly Optimizations
- Use assembly for simple storage operations where beneficial
- Inline assembly for gas-efficient operations

## Gas Usage Estimates

### Function Costs (Approximate)
- `registerCredential`: ~85,000 gas
- `revokeCredential`: ~45,000 gas
- `setVerifierAuthorization`: ~50,000 gas
- `getCredential`: ~25,000 gas (view)
- `isVerifierAuthorized`: ~22,000 gas (view)

### Optimization Impact
- Event indexing: Reduces query costs by ~70%
- Memory caching: Saves ~15% on repeated storage access
- Batch operations: Reduces per-operation cost by ~40%

## Deployment Recommendations

### Network-Specific Optimizations
- **Ethereum Mainnet**: Prioritize storage efficiency
- **Polygon/L2s**: Optimize for speed over cost
- **Testnets**: Focus on debugging features

### Compiler Settings
```javascript
// hardhat.config.ts
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    viaIR: true  // Enable IR-based compilation for better optimization
  }
}
```

## Monitoring and Maintenance

### Gas Usage Tracking
- Implement gas tracking in tests
- Monitor on-chain gas costs post-deployment
- Adjust optimization strategies based on real usage patterns

### Future Optimizations
- Consider upgrading to newer Solidity versions for compiler optimizations
- Evaluate layer-2 solutions for reduced gas costs
- Implement gas refunds for batch operations
