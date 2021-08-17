const chai = require('chai');
const { expect } = require("chai");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy();
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hey");
    const setGreetingTx = await greeter.setGreeting("Wow");
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Wow");
  });
});



describe('---------------Test TokenizeScript---------------', async()=>{
    it('Writer can tokenize script to the Blockchain.', async()=>{
        const Script = await ethers.getContractFactory("Script");
        const script = await Script.deploy();
        await script.deployed();

        const script_id = 1;
        const script_price = 20;
        const script_selling_choise = 1;
        const script_title = "Game of Thrones";
        const writer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const royality = 10;
        const tokenizingTx = await script.TokenizeScript(
            script_price, 
            script_selling_choise,
            script_title, 
            writer,
            writer,
            royality                
        );
        await tokenizingTx.wait();
        let balace_of_writer = await script.balanceOf(writer, script_id);
        console.log("Balace of Writer: "+ balace_of_writer);
        await expect(balace_of_writer).to.equal(1);
    });

    it("Unique Token ID for each script token.", async()=>{
        const Script = await ethers.getContractFactory("Script");
        const script = await Script.deploy();
        await script.deployed();

        const script_price = 20;
        const script_selling_choise = 1;
        const script_title = "Game of Thrones";
        const writer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const royality = 20;
        const tokenizingTx = await script.TokenizeScript(
            script_price, 
            script_selling_choise,
            script_title, 
            writer,
            writer,
            royality                
        );
        await tokenizingTx.wait();

        const script_price2 = 72;
        const script_selling_choise2 = 1;
        const script_title2 = "Pie";
        const writer2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const royality2 = 13;

        const tokenizingTx2 = await script.TokenizeScript(
            script_price2, 
            script_selling_choise2,
            script_title2, 
            writer2,
            writer2,
            royality2                
        );
        await tokenizingTx2.wait();
        
        let script_id1 = await script.getScriptIDByTitle(script_title);  
        let script_id2 = await script.getScriptIDByTitle(script_title2);  
        console.log("Script id 1: "+ script_id1+" , Script id 2: "+script_id2);
        expect(script_id2).to.not.be.equal(script_id1);
    });

});



describe('---------------Transacting ScriptToken----------------', async()=>{

    it('Transfer Script Ownership and Access to the Buyer', async ()=>{
        const Script = await ethers.getContractFactory("Script");
        const script = await Script.deploy();
        await script.deployed();

        const MarketHandler = await ethers.getContractFactory("MarketHandler");
        const marketHandler = await MarketHandler.deploy();
        await marketHandler.deployed();

        const signers = await ethers.getSigners();

        const script_price = 20;
        const script_selling_choise = 1;
        const script_title = "The Wolf of Wallstreet";
        const writer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const royality = 20;
        const tokenizingTx = await script.TokenizeScript(
            script_price, 
            script_selling_choise,
            script_title, 
            writer,
            writer,
            royality                
        );
        await tokenizingTx.wait();

        const script_price2 = 72;
        const script_selling_choise2 = 1;
        const script_title2 = "Pie";
        const writer2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const royality2 = 13;

        const tokenizingTx2 = await script.TokenizeScript(
            script_price2, 
            script_selling_choise2,
            script_title2, 
            writer2,
            writer2,
            royality2                
        );
        await tokenizingTx2.wait();
        const script_id = 1;
        const buyer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        await script.setApprovalForAll(marketHandler.address, true, {from: writer}); 
        let oldBuyerBalance = parseInt(await script.balanceOf(buyer, script_id));
        let oldWriterBalance = await script.balanceOf(writer, script_id);
        console.log("oldWriteBalance: "+oldWriterBalance, " | oldBuyerBalance: ", oldBuyerBalance);

        await marketHandler.connect(signers[0]).buyScript(script_id, signers[1].address);
        let buyerBalance = parseInt(await script.balanceOf(buyer, script_id));
        let newWriterBalance = parseInt(await script.balanceOf(writer, script_id));
        console.log(
            "NewWriteBalance: "+newWriterBalance+" | "+
            "Buyer Balance after purchase: "+buyerBalance);
        expect(newWriterBalance).to.be.equal(0);
        expect(buyerBalance).to.be.equal(1);
    });

});

describe('--------------- Fetch Tokens That Was Created ----------------', async()=>{

    it('Get all the script tokens all together.', async ()=>{
        const Script = await ethers.getContractFactory("Script");
        const script = await Script.deploy();
        await script.deployed();

        const signers = await ethers.getSigners();

        const script_price = 20;
        const script_selling_choise = 1;
        const script_title = "The Wolf of Wallstreet";
        const writer = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const royality = 20;
        const tokenizingTx = await script.TokenizeScript(
            script_price, 
            script_selling_choise,
            script_title, 
            writer,
            writer,
            royality                
        );
        await tokenizingTx.wait();

        const script_price2 = 72;
        const script_selling_choise2 = 1;
        const script_title2 = "Pie";
        const writer2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const royality2 = 13;

        const tokenizingTx2 = await script.TokenizeScript(
            script_price2, 
            script_selling_choise2,
            script_title2, 
            writer2,
            writer2,
            royality2                
        );
        await tokenizingTx2.wait();
        const allTokens = await script.getAllScripts(); 
        expect(allTokens).to.not.be.equal(null);
        console.log("All the tokens: "+allTokens);
    });

});

//     it('Get a script tokens with given Id.', async ()=>{
//         const marketHandler = await MarketHandler.new();
//         const script_market = await ScriptsMarket.new(marketHandler.address);
//         await marketHandler.scripTokenSetter(script_market.address);
//         const script_price = web3.utils.toWei('1', 'ether');
//         const writer = accounts[4];
//         const script_id = 1;
//         const script_selling_choise = 1;
//         const script_selling_choise2 = 1;
//         const script_title = "Life of Pi";
//         const script_title2 = "That's my Son";
//         const royality = 11;
//         const royality2 = 5;
//         await script_market.setApprovalForAll(marketHandler.address, true, {from: writer}); 
//         await script_market.TokenizeScript(
//             script_price, 
//             script_selling_choise,
//             script_title, 
//             writer,
//             writer,
//             royality
//         );
//         await script_market.setApprovalForAll(marketHandler.address, true, {from: writer}); 
//         await script_market.TokenizeScript(
//             script_price, 
//             script_selling_choise2,
//             script_title2, 
//             writer,
//             writer,
//             royality2
//         ); 
//         const aToken = await script_market.getScriptObject(script_id);
//         console.log("The tokens with ", script_id,": ", aToken);
//     });

// });
