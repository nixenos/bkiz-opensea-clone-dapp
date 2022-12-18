// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const DappMarket = await hre.ethers.getContractFactory("DappMarket");
  const market = await DappMarket.deploy();
  await market.deployed();
  console.log("DappMarket deployed to:", market.address);

  writeFileSync('./config.js', `
  export const marketAddress = "${market.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

