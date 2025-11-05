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

    event CredentialRegistered(
        uint256 indexed id,
        address indexed owner,
        bytes32 indexed docHash
    );

    event CredentialRevoked(uint256 indexed id, address indexed owner);

    event VerifierAuthorizationUpdated(
        uint256 indexed id,
        address indexed owner,
        address indexed verifier,
        bool authorized
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
        require(bytes(encryptedPayload).length != 0, "Empty encrypted payload");

        id = _nextId++;
        Credential storage cred = _credentials[id];

        cred.id = id;
        cred.owner = msg.sender;
        cred.docHash = docHash;
        cred.encryptedPayload = encryptedPayload;
        cred.createdAt = uint64(block.timestamp);
        cred.revoked = false;

        _ownerCredentials[msg.sender].push(id);

        emit CredentialRegistered(id, msg.sender, docHash);
    }

    /// @notice Get a credential by id.
    function getCredential(
        uint256 id
    )
        external
        view
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

        emit VerifierAuthorizationUpdated(id, msg.sender, verifier, authorized);
    }

    /// @notice Check whether a given verifier is authorized for a credential.
    function isVerifierAuthorized(
        uint256 id,
        address verifier
    ) external view returns (bool) {
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

    /// @notice Batch revoke multiple credentials owned by the caller.
    /// @param ids Array of credential ids to revoke.
    function batchRevokeCredentials(uint256[] calldata ids) external {
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            Credential storage cred = _credentials[id];
            require(cred.owner != address(0), "Credential not found");
            require(cred.owner == msg.sender, "Not credential owner");
            require(!cred.revoked, "Already revoked");

            cred.revoked = true;
            emit CredentialRevoked(id, msg.sender);
        }
    }

    /// @notice Batch authorize a verifier for multiple credentials.
    /// @param ids Array of credential ids.
    /// @param verifier Verifier address to authorize.
    function batchAuthorizeVerifier(uint256[] calldata ids, address verifier) external {
        require(verifier != address(0), "Invalid verifier");

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            Credential storage cred = _credentials[id];
            require(cred.owner != address(0), "Credential not found");
            require(cred.owner == msg.sender, "Not credential owner");
            require(!cred.revoked, "Credential revoked");

            bool wasAuthorized = _authorizations[id][verifier];
            _authorizations[id][verifier] = true;

            emit VerifierAuthorizationUpdated(id, msg.sender, verifier, true);

            if (!wasAuthorized) {
                emit VerifierAuthorizationRevoked(id, msg.sender, verifier);
            }
        }
    }

    /// @notice Get total count of credentials owned by an address.
    /// @param owner Address to query.
    /// @return count Total number of credentials owned.
    function getOwnerCredentialCount(address owner) external view returns (uint256 count) {
        return _ownerCredentials[owner].length;
    }
}


