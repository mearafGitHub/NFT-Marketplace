require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 const INFURA_URL = "https://rinkeby.infura.io/v3/32e9697d24da4be78e3df4c022c96b87"
//  'https://ropsten.infura.io/v3/32e9697d24da4be78e3df4c022c96b87';
 const PRIVATE_KEY = '09728a1714e1aad105816801714446e27e32174312c16cb528c69c4196b67554'
 
 module.exports = {
   solidity: "0.8.0",
   networks:{
     ropsten:{
       url: INFURA_URL,
       accounts: [`0x${PRIVATE_KEY}`]
     },
     rinkeby:{
      url: INFURA_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
     hardhat: {
       chainId: 87
     }
   }
 };
