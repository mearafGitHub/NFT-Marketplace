// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import './Script.sol';
// import 'hardhat/console.sol';


contract MarketHandler{
    
    event SoldScript(address _buyer, Script.ScriptType script, uint paidAmount, address _writer); 
    event RoyalityPaid(address _buyer, uint paidAmount, address _writer); 

    bool private _auction;
    bool private _justGotPayed;
    uint private scriptSellingChoise;
    uint256 private _tokenIdCounter;
    Script private script;
    uint private tokenizingPrice = 1;
    address owner;

    constructor () public {
        owner = msg.sender;
    }

    function buyScript(uint256 _scriptTokenId) payable public{
        Script.ScriptType memory _script = script.getScriptByID(_scriptTokenId);
        // console.log('Get Script %s from Script.sol', _script);
        uint _price = _script.scriptPrice;
        address payable _writer = _script.scriptWriter;
        // require(msg.value ==  _price, "You have to pay the script price");
        script.transferScriptOwnership(_scriptTokenId, msg.sender);
        emit SoldScript(msg.sender,_script, _price, _writer);
    }

    function payRoyality(uint _price, uint _royality, address payable _writer, address _buyer) internal returns(bool){
        uint amount = _price/_royality;
        _writer.transfer(amount);
        emit RoyalityPaid(_buyer, amount, _writer);
        return true;
    }

    receive () external payable{}

}