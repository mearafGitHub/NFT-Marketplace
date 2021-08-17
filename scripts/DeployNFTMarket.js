// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Script = await ethers.getContractFactory("Script");
  // const instance = await upgrades.deployProxy(Script);
  // await instance.deployed();

  // // Upgrading
  // const ScriptV2 = await ethers.getContractFactory("ScriptV2");
  // const upgraded = await upgrades.upgradeProxy(instance.address, ScriptV2);


  const Script = await hre.ethers.getContractFactory("Script");
  const script = await Script.deploy();
  const Market = await hre.ethers.getContractFactory("MarketHandler");
  const market = await Market.deploy();

  await market.deployed();
  await script.deployed();

  console.log("Script deployed to:", script.address);
  console.log("Market deployed to:", market.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
