// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    enum Status { Manufactured, Shipped, InTransit, Delivered, Received }

    struct Product {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        address currentOwner;
        Status status;
        uint256 timestamp;
        string location;
    }

    struct StatusHistory {
        Status status;
        uint256 timestamp;
        address updatedBy;
        string location;
        string notes;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => StatusHistory[]) public productHistory;
    mapping(address => bool) public authorizedParties;

    uint256 public productCount;
    address public admin;

    event ProductCreated(uint256 indexed productId, string name, address manufacturer);
    event StatusUpdated(uint256 indexed productId, Status status, address updatedBy);
    event OwnershipTransferred(uint256 indexed productId, address from, address to);
    event Authorized(address indexed party, bool enabled);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedParties[msg.sender] || msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedParties[msg.sender] = true;
        emit Authorized(msg.sender, true);
    }

    function addAuthorizedParty(address _party, bool enabled) external onlyAdmin {
        authorizedParties[_party] = enabled;
        emit Authorized(_party, enabled);
    }

    function createProduct(
        string memory _name,
        string memory _description,
        string memory _location
    ) external onlyAuthorized returns (uint256) {
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: _name,
            description: _description,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            status: Status.Manufactured,
            timestamp: block.timestamp,
            location: _location
        });

        productHistory[productCount].push(StatusHistory({
            status: Status.Manufactured,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            location: _location,
            notes: "Product created"
        }));

        emit ProductCreated(productCount, _name, msg.sender);
        return productCount;
    }

    function updateStatus(
        uint256 _productId,
        Status _status,
        string memory _location,
        string memory _notes
    ) external onlyAuthorized {
        require(_productId > 0 && _productId <= productCount, "Invalid product");
        Product storage p = products[_productId];
        p.status = _status;
        p.timestamp = block.timestamp;
        p.location = _location;

        productHistory[_productId].push(StatusHistory({
            status: _status,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            location: _location,
            notes: _notes
        }));

        emit StatusUpdated(_productId, _status, msg.sender);
    }

    function transferOwnership(uint256 _productId, address _newOwner) external onlyAuthorized {
        require(_productId > 0 && _productId <= productCount, "Invalid product");
        Product storage p = products[_productId];
        address prev = p.currentOwner;
        p.currentOwner = _newOwner;
        emit OwnershipTransferred(_productId, prev, _newOwner);
    }

    function getProduct(uint256 _productId) external view returns (Product memory) {
        return products[_productId];
    }

    function getProductHistory(uint256 _productId) external view returns (StatusHistory[] memory) {
        return productHistory[_productId];
    }
}
