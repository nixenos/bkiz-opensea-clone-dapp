// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract DappMarket is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.01 ether;
    address payable owner;

    mapping(uint256 => Product) private idToProduct;

    struct Product {
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }

    event ProductCreated (
      uint256 indexed tokenId,
      address seller,
      address owner,
      uint256 price,
      bool sold
    );

    constructor() ERC721("Nixen's tokens", "NXNT") {
      owner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    function updateListingPrice(uint _listingPrice) public payable {
      require(owner == msg.sender, "Only marketplace owner can update listing price.");
      listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    /* Mints a token and lists it in the marketplace */
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();

      _mint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, tokenURI);
      createProduct(newTokenId, price);
      return newTokenId;
    }

    function createProduct(
      uint256 tokenId,
      uint256 price
    ) private {
      require(price > 0, "Price must be more than 0");
      require(msg.value == listingPrice, "Price must be the same as listing");

      idToProduct[tokenId] =  Product(
        tokenId,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      _transfer(msg.sender, address(this), tokenId);
      emit ProductCreated(
        tokenId,
        msg.sender,
        address(this),
        price,
        false
      );
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(uint256 tokenId, uint256 price) public payable {
      require(idToProduct[tokenId].owner == msg.sender, "Only item owner can do this");
      require(msg.value == listingPrice, "Price must be the same as listing");
      idToProduct[tokenId].sold = false;
      idToProduct[tokenId].price = price;
      idToProduct[tokenId].seller = payable(msg.sender);
      idToProduct[tokenId].owner = payable(address(this));
      _itemsSold.decrement();

      _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createSale(
      uint256 tokenId
      ) public payable {
      uint price = idToProduct[tokenId].price;
      address seller = idToProduct[tokenId].seller;
      require(msg.value == price, "Please submit the asking price");
      idToProduct[tokenId].owner = payable(msg.sender);
      idToProduct[tokenId].sold = true;
      idToProduct[tokenId].seller = payable(address(0));
      _itemsSold.increment();
      _transfer(address(this), msg.sender, tokenId);
      payable(owner).transfer(listingPrice);
      payable(seller).transfer(msg.value);
    }

    /* Returns all unsold market items */
    function fetchProducts() public view returns (Product[] memory) {
      uint itemCount = _tokenIds.current();
      uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
      uint currentIndex = 0;

      Product[] memory items = new Product[](unsoldItemCount);
      for (uint i = 0; i < itemCount; i++) {
        if (idToProduct[i + 1].owner == address(this)) {
          uint currentId = i + 1;
          Product storage currentProduct = idToProduct[currentId];
          items[currentIndex] = currentProduct;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (Product[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToProduct[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      Product[] memory items = new Product[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToProduct[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          Product storage currentProduct = idToProduct[currentId];
          items[currentIndex] = currentProduct;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items a user has listed */
    function fetchProductsListed() public view returns (Product[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToProduct[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      Product[] memory items = new Product[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToProduct[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          Product storage currentProduct = idToProduct[currentId];
          items[currentIndex] = currentProduct;
          currentIndex += 1;
        }
      }
      return items;
    }
}