// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CredentialVault
/// @notice Minimal MVP for encrypted credential registration and authorization.
/// @dev All cleartext encryption / decryption happens off-chain.
///      The contract only stores hashes, encrypted payloads and authorization rules.
contract CredentialVault {
    struct Credential {
        uint256 id;
        address owner;
        bytes32 docHash; // SHA-256 hash of the original document
        string encryptedPayload; // ciphertext or encrypted file pointer (e.g. IPFS CID)
        uint64 createdAt;
        bool revoked;
    }

    /// @dev Auto-incrementing credential id.
    uint256 private _nextId = 1;

    /// @dev credentialId => Credential
    mapping(uint256 => Credential) private _credentials;

    /// @dev owner => list of owned credential ids
    mapping(address => uint256[]) private _ownerCredentials;

    /// @dev credentialId => verifier => isAuthorized
    mapping(uint256 => mapping(address => bool)) private _authorizations;

    /// @dev Verification record structure
    struct VerificationRecord {
        bool verified;
        bytes32 verifiedHash;
        uint64 verifiedAt;
    }

    /// @dev credentialId => verifier => VerificationRecord
    mapping(uint256 => mapping(address => VerificationRecord)) private _verificationRecords;

    event CredentialRegistered(
        uint256 indexed id,
        address indexed owner,
        bytes32 docHash,
        uint64 timestamp
    );

    event CredentialRevoked(uint256 indexed id, address indexed owner);

    event VerifierAuthorizationUpdated(
        uint256 indexed id,
        address indexed owner,
        address verifier,
        bool authorized,
        uint64 timestamp
    );

    event CredentialQueried(
        uint256 indexed id,
        address indexed querier,
        uint64 timestamp
    );

    event CredentialVerified(
        uint256 indexed id,
        address indexed verifier,
        bytes32 verifiedHash,
        bool matches,
        uint64 timestamp
    );

    /// @notice Register a new encrypted credential.
    /// @param docHash SHA-256 hash of the original document.
    /// @param encryptedPayload Off-chain encrypted payload (ciphertext or encrypted file pointer).
    /// @return id Newly created credential id.
    function registerCredential(
        bytes32 docHash,
        string calldata encryptedPayload
    ) external returns (uint256 id) {
        require(docHash != bytes32(0), "Invalid docHash");
        require(bytes(encryptedPayload).length > 0, "Empty encrypted payload");

        id = _nextId++;
        Credential storage cred = _credentials[id];

        cred.id = id;
        cred.owner = msg.sender;
        cred.docHash = docHash;
        cred.encryptedPayload = encryptedPayload;
        cred.createdAt = uint64(block.timestamp);
        cred.revoked = false;

        _ownerCredentials[msg.sender].push(id);

        emit CredentialRegistered(id, msg.sender, docHash, cred.createdAt);
    }

    /// @notice Get a credential by id.
    function getCredential(
        uint256 id
    )
        external
        returns (
            uint256 credentialId,
            address owner,
            bytes32 docHash,
            string memory encryptedPayload,
            uint64 createdAt,
            bool revoked
        )
    {
        Credential storage cred = _credentials[id];
        require(cred.owner != address(0), "Credential not found");

        emit CredentialQueried(id, msg.sender, uint64(block.timestamp));

        return (
            cred.id,
            cred.owner,
            cred.docHash,
            cred.encryptedPayload,
            cred.createdAt,
            cred.revoked
        );
    }

    /// @notice List all credential ids owned by an address.
    function getOwnerCredentials(
        address owner
    ) external view returns (uint256[] memory) {
        return _ownerCredentials[owner];
    }

    /// @notice Mark a credential as revoked (logical delete).
    function revokeCredential(uint256 id) external {
        Credential storage cred = _credentials[id];
        require(cred.owner != address(0), "Credential not found");
        require(cred.owner == msg.sender, "Not credential owner");
        require(!cred.revoked, "Already revoked");

        cred.revoked = true;

        emit CredentialRevoked(id, msg.sender);
    }

    /// @notice Authorize or revoke a verifier for a specific credential.
    /// @param id Credential id.
    /// @param verifier Verifier wallet address.
    /// @param authorized True to authorize, false to revoke.
    function setVerifierAuthorization(
        uint256 id,
        address verifier,
        bool authorized
    ) external {
        require(verifier != address(0), "Invalid verifier");
        Credential storage cred = _credentials[id];
        require(cred.owner != address(0), "Credential not found");
        require(cred.owner == msg.sender, "Not credential owner");
        require(!cred.revoked, "Credential revoked");

        _authorizations[id][verifier] = authorized;

        emit VerifierAuthorizationUpdated(id, msg.sender, verifier, authorized, uint64(block.timestamp));
    }

    /// @notice Check whether a given verifier is authorized for a credential.
    function isVerifierAuthorized(
        uint256 id,
        address verifier
    ) external view returns (bool) {
        // Enhanced validation: check input parameters
        require(id > 0, "Invalid credential ID");
        require(verifier != address(0), "Invalid verifier address");

        Credential storage cred = _credentials[id];
        if (cred.owner == address(0) || cred.revoked) {
            return false;
        }
        if (verifier == cred.owner) {
            // Owner is implicitly authorized.
            return true;
        }
        return _authorizations[id][verifier];
    }

    /// @notice Verify a credential by comparing hash
    /// @param id The credential ID to verify
    /// @param fileHash The hash of the file being verified (as bytes32)
    function verifyCredential(
        uint256 id,
        bytes32 fileHash
    ) external {
        require(id > 0, "Invalid credential ID");
        require(fileHash != bytes32(0), "Invalid file hash");
        
        Credential storage cred = _credentials[id];
        require(cred.owner != address(0), "Credential not found");
        require(!cred.revoked, "Credential revoked");
        
        // Check if verifier is authorized
        bool isAuthorized = (msg.sender == cred.owner) || _authorizations[id][msg.sender];
        require(isAuthorized, "Not authorized to verify");
        
        // Compare fileHash with docHash (both are bytes32)
        // encryptedPayload stores the hash as string, but we compare with docHash which is the source of truth
        bool matches = (fileHash == cred.docHash);
        
        // Record verification result
        _verificationRecords[id][msg.sender] = VerificationRecord({
            verified: true,
            verifiedHash: fileHash,
            verifiedAt: uint64(block.timestamp)
        });
        
        emit CredentialVerified(
            id,
            msg.sender,
            fileHash,
            matches,
            uint64(block.timestamp)
        );
    }

    /// @notice Get verification record for a credential
    /// @param id The credential ID
    /// @param verifier The verifier address
    function getVerificationRecord(
        uint256 id,
        address verifier
    ) external view returns (bool verified, bytes32 verifiedHash, uint64 verifiedAt) {
        VerificationRecord memory record = _verificationRecords[id][verifier];
        return (record.verified, record.verifiedHash, record.verifiedAt);
    }
}


