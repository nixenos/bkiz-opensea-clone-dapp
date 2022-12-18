const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DappMarket", function() {
  it("Should create and execute market sales", async function() {
    /* deploy the marketplace */
    const DappMarket = await ethers.getContractFactory("DappMarket")
    const marketplace = await DappMarket.deploy()
    await marketplace.deployed()

    let listingPrice = await marketplace.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    /* create two tokens */
    await marketplace.createToken("testlocation1", auctionPrice, { value: listingPrice })
    await marketplace.createToken("testlocation2", auctionPrice, { value: listingPrice })

    const [_, buyerAddress] = await ethers.getSigners()

    /* execute sale of token to another user */
    await marketplace.connect(buyerAddress).createSale(1, { value: auctionPrice })

    /* resell a token */
    await marketplace.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice })

    /* query for and return the unsold items */
    items = await marketplace.fetchProducts()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await marketplace.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})
